<?
/* Session cookies are set before the session starts — PHP ignores these once
   a session is open. HttpOnly keeps the id away from JavaScript, so an XSS
   bug cannot read it; SameSite=Lax stops another site POSTing as a signed-in
   admin; Secure is set whenever the request arrived over TLS. */
if (session_status() == PHP_SESSION_NONE) {
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', $is_https ? '1' : '0');
    if (PHP_VERSION_ID >= 70300) {
        ini_set('session.cookie_samesite', 'Lax');
    }
    ini_set('session.gc_maxlifetime', '1800');
    session_start();
}

 new DateTimeZone('Asia/Calcutta');
    date_default_timezone_set('Asia/Kolkata');
 $thisdate=date('Y-m-d');
 $thistime=date('Y-m-d H:i:s');

/* Errors are logged, never printed. display_errors was on, so any warning
   echoed absolute server paths, SQL fragments and occasionally credentials
   straight into the page. */
$app_debug = (getenv('APP_DEBUG') === '1');
ini_set('display_errors', $app_debug ? '1' : '0');
ini_set('log_errors', '1');
error_reporting($app_debug ? E_ALL : (E_ALL & ~E_NOTICE & ~E_DEPRECATED));

    
define("DB_HOST", getenv("DB_HOST") ?: "localhost");
define("DB_PORT", getenv("DB_PORT") ?: "3306");
define("DB_NAME", getenv("DB_NAME") ?: "YOUR_DB_NAME");
define("DB_USER", getenv("DB_USER") ?: "YOUR_DB_USER");
define("DB_PASS", getenv("DB_PASS") ?: "YOUR_DB_PASSWORD");
define("RS", "&#8377;");
define("THISTIME", date('Y-m-d H:i:s'));
$THISTIME=date('Y-m-d H:i:s');
$toMail = getenv("SITE_MAIL") ?: "info@deeprealestate.in";


	function TimeIsBetweenTwoTimes($from, $till, $input) {
    $f = DateTime::createFromFormat('H:i:s', $from);
    $t = DateTime::createFromFormat('H:i:s', $till);
    $i = DateTime::createFromFormat('H:i:s', $input);
    if ($f > $t) $t->modify('+1 day');
	return ($f <= $i && $i <= $t) || ($f <= $i->modify('+1 day') && $i <= $t);
}

/* ------------------------------------------------------- login throttling

   Keyed by client IP in a file under the system temp directory, so it needs
   no schema change and survives across sessions — a session-based counter
   would be defeated by simply dropping the cookie.

   This is deliberately modest: it slows password guessing against a single
   host. It is not a defence against a distributed attempt; that needs a
   CAPTCHA or a WAF in front of the site. */

define('LOGIN_MAX_ATTEMPTS', 8);
define('LOGIN_LOCKOUT_SECONDS', 900);

function login_throttle_file()
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'cli';
    return sys_get_temp_dir() . '/dre_login_' . sha1($ip) . '.json';
}

function login_throttle_state()
{
    $f = login_throttle_file();
    if (!is_readable($f)) {
        return array('count' => 0, 'first' => time());
    }
    $raw = @file_get_contents($f);
    $data = $raw === false ? null : json_decode($raw, true);
    if (!is_array($data) || !isset($data['count'], $data['first'])) {
        return array('count' => 0, 'first' => time());
    }
    if ((time() - (int) $data['first']) > LOGIN_LOCKOUT_SECONDS) {
        return array('count' => 0, 'first' => time());
    }
    return array('count' => (int) $data['count'], 'first' => (int) $data['first']);
}

/** False once this IP has burned through its attempts inside the window. */
function login_throttle_allow()
{
    $s = login_throttle_state();
    return $s['count'] < LOGIN_MAX_ATTEMPTS;
}

function login_throttle_record_failure()
{
    $s = login_throttle_state();
    $s['count']++;
    @file_put_contents(login_throttle_file(), json_encode($s), LOCK_EX);
}

function login_throttle_clear()
{
    @unlink(login_throttle_file());
}

/* ---------------------------------------------------------------- uploads

   Every upload handler used to take its extension straight off the submitted
   filename and concatenate it into the destination path:

       $extn = pathinfo($_FILES['file']['name'][$i], PATHINFO_EXTENSION);
       $filename = $upladPath . "PropertyID" . $_POST['pid'] . "-$i." . $extn;

   Uploading admin.php therefore wrote executable PHP into a web-served
   directory. Combined with the API having had no authentication, that was
   remote code execution for anyone who could reach the URL.

   safe_upload_ext() is the replacement: it whitelists by extension, confirms
   image uploads really are images by inspecting the file rather than trusting
   its name, and returns null when anything looks wrong. */

define('UPLOAD_IMAGE_EXTS', array('jpg', 'jpeg', 'png', 'gif', 'webp'));
define('UPLOAD_DOC_EXTS', array('pdf', 'doc', 'docx', 'xls', 'xlsx'));

/**
 * Validate one uploaded file and return a safe lowercase extension.
 *
 * @param string $original  the client-supplied filename (never trusted)
 * @param string $tmp_path  the local temp path PHP wrote the upload to
 * @param string $kind      'image' or 'doc'
 * @return string|null      the extension, or null if the file is not allowed
 */
function safe_upload_ext($original, $tmp_path, $kind = 'image')
{
    $allowed = ($kind === 'doc') ? UPLOAD_DOC_EXTS : UPLOAD_IMAGE_EXTS;

    $ext = strtolower(pathinfo((string) $original, PATHINFO_EXTENSION));
    /* "shell.php.jpg" and "shell.jpg%00.php" both die here: the extension is
       taken as the final segment only, and must match the whitelist exactly. */
    if ($ext === '' || !in_array($ext, $allowed, true)) {
        return null;
    }
    if (preg_match('/[^a-z0-9]/', $ext)) {
        return null;
    }

    if ($kind === 'image') {
        if (!is_readable($tmp_path)) {
            return null;
        }
        /* getimagesize() returns false for anything that is not a real image,
           so a .jpg full of PHP source is rejected on content, not on name. */
        $info = @getimagesize($tmp_path);
        if ($info === false || empty($info[2])) {
            return null;
        }
        $by_type = array(
            IMAGETYPE_JPEG => 'jpg',
            IMAGETYPE_PNG  => 'png',
            IMAGETYPE_GIF  => 'gif',
            IMAGETYPE_WEBP => 'webp',
        );
        if (!isset($by_type[$info[2]])) {
            return null;
        }
        /* Trust the sniffed type over the submitted name. */
        return $by_type[$info[2]];
    }

    return $ext;
}

/** Strip anything that could escape the upload directory. */
function safe_upload_stem($stem)
{
    $stem = str_replace(array('/', '\\', "\0"), '', (string) $stem);
    $stem = preg_replace('/[^A-Za-z0-9._-]/', '_', $stem);
    $stem = ltrim($stem, '.');
    return $stem === '' ? 'file' : substr($stem, 0, 80);
}

$photoidextension=array("jpg", "JPG", "gif", "GIF", "jpeg", "JPEG", "png", "PNG", "pdf", "pdf");
define("IMGEXTN", $photoidextension);
function chkspl($sr){
$splchr= "~,`,!,#,$,%,^,&,*,(,),=,\,|,{,[,],',;,?,/,>,},<,INSERT,DELETE,UPDATE,SELECT";
$splchar=explode(",",$splchr);
$hn='';
//@,.,+,-,_
foreach ($splchar as $key => $value){ if(strpos($sr, $value) !== false) { $hn.= $value;} }
 return $hn;
}


//echo"Sucess";
if(function_exists('isimage')){
function isimage($id){
$img=basename($id);
$myext=pathinfo($img);
$myextn=$myext['extension'];
$hju = array("jpg", "JPG", "png", "PNG", "JPEG", "jpeg", "Jpeg", "gif", "GIF");
if(in_array($myextn, $hju)){return true;} else {return false;}

}}
if(function_exists('ispdf')){
function ispdf($id){
$img=basename($id);
$myext=pathinfo($img);
$myextn=$myext['extension'];
$hju = array("pdf", "PDF", "doc", "docx", "xls", "xlsx");
if(in_array($myextn, $hju)){return true;} else {return false;}

}}
function getRights($email){
/* Was interpolating $_SESSION[user] straight into the SQL, and ignored the
   $email argument entirely. */
$res1=DB::queryFirstRow("SELECT rights FROM admin WHERE email=%s",
                        isset($_SESSION['user']) ? $_SESSION['user'] : '');
return $res1 ? $res1['rights'] : null;
}
function get_content($URL){
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_URL, $URL);
      $data = curl_exec($ch);
      curl_close($ch);
      return $data;
}
function limit_text($text, $limit) {
    if (str_word_count($text, 0) > $limit) {
        $words = str_word_count($text, 2);
        $pos   = array_keys($words);
        $text  = substr($text, 0, $pos[$limit]) . '...';
    }
    return $text;
}
function getPrice($u){
    $u=round($u,0);$g='Call for Price';
    if(strlen($u) == 4) { $f = $u/1000; $g="&#8377 ".round($f,2)." Thousand";} else
    if(strlen($u) == 5) { $f = $u/10000; $g="&#8377 ".round($f,2)." Thousand";} else
    if(strlen($u) == 6) { $f = $u/100000; $g="&#8377 ".round($f,2)." Lac";} else
    if(strlen($u) == 7) { $f = $u/1000000; $g="&#8377 ".round($f,2)." Lac";} else
    if(strlen($u) == 8) { $f = $u/10000000; $g="&#8377 ".round($f,2)." Cr.";} else
    if(strlen($u) == 9) { $f = $u/100000000; $g="&#8377 ".round($f,2)." Cr.";} else
    if(strlen($u) == 10) { $f = $u/1000000000; $g="&#8377 ".round($f,2)." Ab.";} else
    if(strlen($u) == 11) { $f = $u/10000000000; $g="&#8377 ".round($f,2)." Ab.";} 
    return $g;
    
}
function getPropertyTypes($u){
    $rt=DB::query("SELECT * FROM category WHERE ptype='$u'");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['catid']."'>".$t['category']."</option>";
    }
    return $f;
}
function getSelectedPropertyTypes($u,$v){
    $rt=DB::query("SELECT * FROM category ");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($v==$t['catid']){ $f .=" selected ";}
        $f .="value='".$t['catid']."'>".$t['category']."</option>";
    }
    return $f;
}

function getCityList(){
    $rt=DB::query("SELECT * FROM cities WHERE cityName<>''");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['city_id']."'>".$t['cityName']."</option>";
    }
    return $f;
}
function getSelectedCityList($u){
    $rt=DB::query("SELECT * FROM cities WHERE cityName<>''");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($u==$t['city_id']){ $f .=" selected ";}
        $f .="value='".$t['city_id']."'>".$t['cityName']."</option>";
    }
    return $f;
}

function cityName($u){
    $rt=DB::query("SELECT * FROM cities WHERE city_id='$u'");
    foreach($rt as $t){
        $f=$t['cityName'];
    }
    return $f;
}
function getLocationList($u){
    $rt=DB::query("SELECT * FROM cityLocations WHERE cityid='$u'");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['loc_id']."'>".$t['locationName']."</option>";
    }
    return $f;
}

function getSelectedLocationList($u,$v){
    $rt=DB::query("SELECT * FROM cityLocations ");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($v==$t['loc_id']){ $f.=" selected ";}
        $f .="value='".$t['loc_id']."'>".$t['locationName']."</option>";
    }
    return $f;
}

function locationName($u){
    $rt=DB::query("SELECT * FROM cityLocations WHERE loc_id='$u'");
    foreach($rt as $t){
        $f=$t['locationName'];
    }
    return $f;
}

function getDevelopetrsList(){
    $rt=DB::query("SELECT * FROM developers ORDER by name ASC");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['did']."'>".$t['name']."</option>";
    }
    return $f;
}
function getSelectedDevelopetrsList($u){
    $rt=DB::query("SELECT * FROM developers ORDER by name ASC");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($u==$t['did']){$f .=" selected ";}
        $f .="value='".$t['did']."'>".$t['name']."</option>";
    }
    return $f;
}
function developerInfo($u,$v){
    $rt=DB::query("SELECT * FROM developers WHERE did='$u'");
       
    return $rt[0][$v];
}
function getUnitList(){
    $rt=DB::query("SELECT * FROM units ORDER by u_id ASC");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['u_units']."'>".$t['u_units']."</option>";
    }
    return $f;
}

function getSelectedUnitList($u){
    $rt=DB::query("SELECT * FROM units ORDER by u_id ASC");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($u==$t['u_units']){ $f .=" selected ";}
        $f .="value='".$t['u_units']."'>".$t['u_units']."</option>";
    }
    return $f;
}
function categoryName($u){
    $rt=DB::query("SELECT * FROM category WHERE catid ='$u'");
    return $rt[0]['category'];
}
function typeName($u){
     $rt=DB::query("SELECT * FROM catp WHERE cp_id ='$u'");
    return $rt[0]['cp_name'];

}
function getSelectedPTypeList($u){
    $rt=DB::query("SELECT * FROM catp WHERE cp_name<>''");$f='';
    foreach($rt as $t){
        $f .="<option ";
        if($u==$t['cp_id']){ $f .=" selected ";}
        $f .="value='".$t['cp_id']."'>".$t['cp_name']."</option>";
    }
    return $f;
}
function getPTypeList(){
    $rt=DB::query("SELECT * FROM catp WHERE cp_name<>''");$f='';
    foreach($rt as $t){
        $f .="<option value='".$t['cp_id']."'>".$t['cp_name']."</option>";
    }
    return $f;
}
function randomDate()
{
    $start_date=date("Y-m-d");
    $end_date = date('Y-m-d', strtotime($start_date. ' + 5 days'));
    $min = strtotime($start_date);
    $max = strtotime($end_date);

    // Generate random number using above bounds
    $val = rand($min, $max);

    // Convert back to desired date format
    return date('Y-m-d', $val);
}

/*
for($r=1;$r < 36; $r++){
    
    if($r>6){ echo "<td></td>";} else { 
        $s=$r-6;
        echo "<td>$s</td>";}
    if($r %7 ==0){ echo "</tr><td>";}
    
}

*/
?>