<? include 'include/MeecroDB.php';
require_once 'include/auth_guard.php';
auth_require_login();
$get=DB::query("SELECT * from propertyList WHERE pid='$_GET[pid]'")[0];
?>
<!DOCTYPE html>
<html lang="en">
    <head>
       
		<link href="assets/css/app.min.css" rel="stylesheet" type="text/css" id="app-style" />
		<link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />

    </head>

    <!-- body start -->
    <body class="loading" data-layout-color="light"  data-layout-mode="default" data-layout-size="fluid"
    data-topbar-color="light" data-leftbar-position="fixed" data-leftbar-color="light" data-leftbar-size='default' data-sidebar-user='true'>

        <!-- Begin page -->
        <div id="wrapper">
         
                <div class="content">

                    <!-- Start Content-->
                    <div class="container-fluid">

                        <div class="row">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-body">
                                         <form id="addProperty">
                                        <h4 class="header-title">Update Property Picture</h4>
                                       
                                                  <div class="row align-items-center"> 
                                                     
                                                     <div class="mb-3 col-12">
                                                        <label for="epimage_name" class="form-label">Press Control/Command botton to select multiple images</label>
                                                     
                                                        <input id="fuDocument" type="file" class="form-control" accept="image/*" multiple="multiple" />
                                
                                                    </div>
                                                   
                                                    </div>
                                                   
                                                    <div>
                                                        <button id="SavePicture" class="btn input-group-text btn-primary waves-effect waves-light" type="button">save</button>
                                                 </div>
        
                                                </form>
                                            </div> <!-- end col -->

                                             <!-- end col -->
                                        </div>
                                        <!-- end row-->

                                    </div> <!-- end card-body -->
                                </div> <!-- end card -->
                            </div><!-- end col -->
                        </div>
                        <!-- end row -->

                      
                    </div> <!-- container -->

                </div> <!-- content -->

                
       

            
        </div>
        
       

        <!-- Vendor -->
        <script src="assets/libs/jquery/jquery.min.js"></script>
        <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="assets/libs/simplebar/simplebar.min.js"></script>
        <script src="assets/libs/node-waves/waves.min.js"></script>
        <script src="assets/libs/waypoints/lib/jquery.waypoints.min.js"></script>
        <script src="assets/libs/jquery.counterup/jquery.counterup.min.js"></script>
        <script src="assets/libs/feather-icons/feather.min.js"></script>

        <!-- App js-->
        <script src="assets/js/app.min.js"></script>
        <script>
              $("#SavePicture").click(function(){
                if($("#pimage_name").val() == ''){alert('Please select any picture!');} 
                
                else {
                 var fd = new FormData();
var files = $("#fuDocument").get(0).files; // this is my file input in which We can select multiple files.
fd.append("pid", <?=$_GET['pid']?>);

for (var i = 0; i < files.length; i++) {
    fd.append("file[]", files[i]);
}

$.ajax({
    type: "POST",
    url: 'include/function_do.php?upload=yes',
    contentType: false,
    processData: false,
    data: fd,
    success: function (data) {
           if(data=='Picture Updated!'){ window.location.href = 'ListProperty.php';} else {
            alert(data);}
        },  error: function(jqXhr, textStatus, errorMessage){
      console.log("Error: ", errorMessage);
   },
        
        cache: false,
                   
    });}
            });
        </script>
        
    </body>
</html>