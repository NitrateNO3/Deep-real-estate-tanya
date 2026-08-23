<? include 'include/MeecroDB.php';
require_once 'include/auth_guard.php';
auth_require_login();
if(isset($_SESSION['mylogin'])){header("location: index.php");}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Log In | <?=$admin['CompanyName']?></title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta content="A fully featured admin theme which can be used to build CRM, CMS, etc." name="description" />
        <meta content="Coderthemes" name="author" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!-- App favicon -->
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">
<link rel="manifest" href="/assets/favicon/site.webmanifest">

		<!-- App css -->

		<link href="assets/css/app.min.css" rel="stylesheet" type="text/css" id="app-style" />

		<!-- icons -->
		<link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />

    </head>

    <body class="loading authentication-bg authentication-bg-pattern">

        <div class="account-pages my-5">
            <div class="container">

                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-6 col-xl-4">
                        <div class="text-center">   
                            <a href="index.html">
                                <img src="<?=$admin['ThirdLogo']?>" alt="" height="102" class="mx-auto">
                            </a>
                            <p class="text-muted mt-2 mb-4"> <?=$admin['Slogan']?></p>

                        </div>
                        <div class="card">
                            <div class="card-body p-4">
                                
                                <div class="text-center mb-4">
                                    <h4 class="text-uppercase mt-0">Sign In</h4>
                                </div>

                                <form action="#">
                                    <div class="mb-3">
                                        <label for="emailaddress" class="form-label">Email address</label>
                                        <input class="form-control" type="email" id="emailaAdress" required="" placeholder="Enter your email">
                                    </div>

                                    <div class="mb-3">
                                        <label for="passWord" class="form-label">Password</label>
                                        <input class="form-control" type="password" required="" id="ipassWord" placeholder="Enter your password">
                                    </div>

                                 

                                    <div class="mb-3 d-grid text-center">
                                        <button class="btn btn-primary" id="loginSubmit" type="submit"> Log In </button>
                                    </div>
                                </form>

                            </div> <!-- end card-body -->
                        </div>
                        <!-- end card -->

                        <div class="row mt-3">
                            <div class="col-12 text-center">
                                <p> <a href="pages-recoverpw.html" style="color:black !important" class="text-muted ms-1"><i class="fa fa-lock me-1"></i>Forgot your password?</a></p>
                                
                            </div> <!-- end col -->
                        </div>
                        <!-- end row -->

                    </div> <!-- end col -->
                </div>
                <!-- end row -->
            </div>
            <!-- end container -->
        </div>
        <!-- end page -->

        <!-- Vendor -->
        <script src="assets/libs/jquery/jquery.min.js"></script>
        <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="assets/libs/simplebar/simplebar.min.js"></script>
        <script src="assets/libs/node-waves/waves.min.js"></script>
        <script src="assets/libs/waypoints/lib/jquery.waypoints.min.js"></script>
        <script src="assets/libs/jquery.counterup/jquery.counterup.min.js"></script>
        <script src="assets/libs/feather-icons/feather.min.js"></script>

        <!-- App js -->
        <script src="assets/js/app.min.js"></script>
        <script>
            $("#loginSubmit").click(function(e){
                e.preventDefault(e);
                var as= $("#emailaAdress");
                var aw= $("#ipassWord");
                if(as.val()==''){alert('Email is empty.'); as.focus();} else
               if(aw.val()==''){alert('Password is empty.');aw.focus();} else
               { $.post("include/function_do.php?userLogin=1", {usr: as.val(), pass: aw.val()}, function(data, status){
    if(data==1){window.location.href = 'MainMenu.php';}
  });
                   
                   }
                
            });
            
        </script>
    </body>
</html>