<?php
/* Server-side authorisation gate for everything under /admin.

   Before this existed, admin/index.php was the only page that checked
   $_SESSION['mylogin']; the other seventeen pages and the whole write API in
   include/function_do.php were reachable by anyone who knew the URL. The gate
   has to live on the server on every entry point — a redirect in a page's
   markup is decoration, not access control.

   Include this immediately after MeecroDB.php (which starts the session via
   dbc.php). Two entry points:

     require_once 'include/auth_guard.php';   // a page  -> redirects to login
     require_once 'auth_guard.php';           // the API -> 403 and stops

   The API form is chosen automatically for XHR/POST callers so that a expired
   session returns a status code the caller can act on rather than a login page
   rendered inside a JSON response. */

if (!defined('AUTH_GUARD_LOADED')) {
    define('AUTH_GUARD_LOADED', true);

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    /** True when the current session belongs to a signed-in administrator. */
    function auth_is_logged_in()
    {
        return isset($_SESSION['mylogin']) && $_SESSION['mylogin'] !== '';
    }

    /* An idle session is not a valid session. Thirty minutes matches the
       cookie lifetime set in dbc.php. */
    if (auth_is_logged_in()) {
        $idle_limit = 1800;
        if (isset($_SESSION['last_seen']) && (time() - $_SESSION['last_seen']) > $idle_limit) {
            $_SESSION = array();
            session_destroy();
        } else {
            $_SESSION['last_seen'] = time();
        }
    }

    /** Stop the request unless the caller is signed in. */
    function auth_require_login($as_api = null)
    {
        if (auth_is_logged_in()) {
            return;
        }

        if ($as_api === null) {
            $as_api = auth_request_is_api();
        }

        if ($as_api) {
            header('HTTP/1.1 403 Forbidden');
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Not authorised. Please sign in again.'));
        } else {
            header('Location: login_auth.php');
        }
        exit;
    }

    /** A request we should answer with a status code rather than a redirect. */
    function auth_request_is_api()
    {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])
            && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            return true;
        }
        return isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST';
    }
}
