<? include 'include/MeecroDB.php';
require_once 'include/auth_guard.php';
auth_require_login();?><!DOCTYPE html>
<html lang="en">
    <head>
       
		<link href="assets/css/app.min.css" rel="stylesheet" type="text/css" id="app-style" />
		<link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/libs/mohithg-switchery/switchery.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/multiselect/css/multi-select.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/select2/css/select2.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/selectize/css/selectize.bootstrap3.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/bootstrap-touchspin/jquery.bootstrap-touchspin.min.css" rel="stylesheet" type="text/css" />
        
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
                                        <h4 class="header-title">Editing Property</h4>
                                       <? $as=DB::query("SELECT * from propertyList where pid='$_GET[pid]'")[0];
                                          ?>
                                            <div class="row align-items-center">
                                                     <div class="  mb-3 col-4">
                                                        <label for="purpose" class="form-label">Property on</label>
                                                        <select class="form-select" id="purpose" name="purpose">
                                                            <option <? if($as['purpose']=='on Sale'){echo " selected ";}?> value="on Sale">Sale</option>
                                                            <option <? if($as['purpose']=='on Rent'){echo " selected ";}?> value="on Rent">Rent</option>
                                                        </select>
                                                    </div>
                                                    <div class="mb-3  col-4">
                                                        <label for="ptype" class="form-label">Type</label>
                                                        <select class="form-select" id="ptype" name="ptype">
                                                            <option <? if($as['ptype']=='2'){echo " selected ";}?> value='2'>Residential</option>
                                                            <option <? if($as['ptype']=='1'){echo " selected ";}?> value='1'>Commercial</option>
            
                                                        </select>
                                                    </div>
                                                    <div class="mb-3  col-4">
                                                        <label for="subtype" class="form-label">Sub-Type</label>
                                                        <select class="form-select" id="subtype" name="subtype">
                                                            <?=getSelectedPropertyTypes(2,$as['subtype']); ?>
            
                                                        </select>
                                                    </div>
                                                    </div>
                                            <div class="row align-items-center"> 
                                                    <div class="mb-3 col-6">
                                                        <div id="addCity" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="modal-body">
                                                    
                                                        
    <div class="mb-3">
                                                                <label for="newCitytoAdd" class="form-label">Add New City</label>
                                                                <input class="form-control" type="text" required="" id="newCitytoAdd" placeholder="Enter City Name">
                                                            </div>
                                                            <div class="mb-2 text-center">
                                                                <button class="btn rounded-pill btn-primary" id="saveCity">Save</button>
                                                            </div>
    
                                                      
    
                                                    </div>
                                                </div><!-- /.modal-content -->
                                            </div><!-- /.modal-dialog -->
                                        </div><!-- /.modal -->
    
                                        
                                           <a href="#" style='float:right'  data-bs-toggle="modal" data-bs-target="#addCity">Add City</a>
                                       
                                                        <label for="city" class="form-label">City</label>
                                                         <select class="form-select" id="city" name="city">
                                                            <?=getSelectedCityList($as['city']); ?>
            
                                                        </select>
                                                    </div>
                                                    <div class="mb-3 col-6">
                                                        <div id="addLocation" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="modal-body">
                                                    
                                                        <form action="#" class="px-3">
    
                                                            <div class="mb-3">
                                                                <label for="ncity" class="form-label">City</label>
                                                              <select class="form-select" id="ncity" name="city">
                                                            <?=getCityList(); ?>
            
                                                        </select> </div>
    
                                                            <div class="mb-3">
                                                                <label for="newLocationtoAdd" class="form-label">New Location</label>
                                                                <input class="form-control" type="text" required="" id="newLocationtoAdd" placeholder="Enter your Location">
                                                            </div>
                                                            <div class="mb-2 text-center">
                                                                <button class="btn rounded-pill btn-primary" id="saveLocation">Save</button>
                                                            </div>
    
                                                        </form>
    
                                                    </div>
                                                </div><!-- /.modal-content -->
                                            </div><!-- /.modal-dialog -->
                                        </div><!-- /.modal -->
    
                                        
                                           <a href="#" style='float:right'  data-bs-toggle="modal" data-bs-target="#addLocation">Add New</a>
                                       
                                                        <label for="location" class="form-label">Location</label>
                                                         <select class="form-select" id="location" name="location">
                                                            <?=getSelectedLocationList(1,$as['location']); ?>
            
                                                        </select>
                                                    </div>
                                            </div>
                                            <div class="row align-items-center">
                                                    <div class="mb-3  ">
                                                        <label for="sublocation" class="form-label">Address</label>
                                                        <input type="text" value="<?=$as['sublocation']?>" id="sublocation" class="form-control" name="sublocation">
                                                    </div>
                                            </div>
                                            <div class="row align-items-center">
                                                    <div class="mb-3 ">
                                                        <label for="pname" class="form-label">Property Title</label>
                                                        <input type="text" id="pname" value="<?=$as['pname']?>" class="form-control" name="pname">
                                                    </div>
                                            </div>
                                            <div class="row align-items-center">
                                                  
                                           
                                                    <div class="mb-3 col-6 row">
                                                        <label for="psize" class="form-label">Dimension / Size</label>
                                                        <div class="col-6">  
                                                        <input type="text" id="psize" value="<?=$as['psize']?>" class="form-control " name="psize">
                                                        </div><div class="col-6">  
                                                        <select class="form-select " id="unit" name="unit">
                                                            <?=getSelectedUnitList($as['unit']); ?>
                                                        </select></div>
                                                       
                                                    </div>
                                            <div class="mb-3 col-auto">
                                                  <div id="addDeveloper" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="modal-body">
                                                            <div class="mb-3">
                                                                <label for="newDevelopertoAdd" class="form-label">New Developer</label>
                                                                <input class="form-control" type="text" required="" id="newDevelopertoAdd" placeholder="Enter Developer Name">
                                                            </div>
                                                           <div class="mb-3 col-12">
                                                        <label for="dev_logo" class="form-label">Developer Logo</label>
                                                        <input type="file" id="dev_logo" name="dev_logo" class="form-control">
                                                    </div>
                                                            <div class="mb-3">
                                                                <label for="descrition_dev" class="form-label">Description</label>
                                                                <input class="form-control" type="text" required="" id="descrition_dev" placeholder="Enter Developer Details">
                                                            </div>
                                                            <div class="mb-2 text-center">
                                                                <button class="btn rounded-pill btn-primary" id="saveDeveloper">Save</button>
                                                            </div>
                                                        </div>
                                                </div><!-- /.modal-content -->
                                            </div><!-- /.modal-dialog -->
                                        </div><!-- /.modal -->
    
                                        
                                           <a href="#" style='float:right'  data-bs-toggle="modal" data-bs-target="#addDeveloper">Add New</a>
                                       
                                                        <label for="did" class="form-label">Developers</label>
                                                         <select class="form-select" id="did" name="did">
                                                            <?=getSelectedDevelopetrsList($as['did']); ?>
                                                        </select>
                                                    </div>
                                                     </div>
                                            <div class="row align-items-center">
                                            
                                                    <div class="mb-3 col-6 row">
                                                        <label for="price" class="form-label">Price</label><div class="col-4">
                                                        <input type="text" id="price" value="<?=$as['price']?>" class="form-control" name="price"> 
                                                        </div><div class="col-2">per</div><div class="col-6">
                                                        <select class="form-select" id="unit1" name="unit1">
                                                            <?=getSelectedUnitList($as['unit']); ?>
                                                        </select>
                                                    </div></div>
                                                     <div class="mb-3 col-6">
                                                        <label for="movein" class="form-label">Possession</label>
                                                     
                                                        <select class="form-select" id="movein" name="movein">
                                                            <option <? if($as['movein']=='Under-Construction'){ echo " selected ";} ?> value="Under-Construction">Under Construction</option>
                                                        <option <? if($as['movein']=='Winin 6 Month'){ echo " selected ";} ?> value="Winin 6 Month">Winin 6 Month</option>
                                                        <option <? if($as['movein']=='Raw'){ echo " selected ";} ?> value="Raw">Raw</option>
                                                        <option <? if($as['movein']=='Immediate'){ echo " selected ";} ?> value="Immediate">Immediate</option>
                                                        </select>
                                                    </div>
                                            </div>
                                             
                                            <div class="row align-items-center">        
                                            
                                                    <div class="mb-3 ">
                                                        <label for="details" class="form-label">Property Description</label>
                                                         <textarea class="form-control" id="details"  name="details" rows="5"><?=$as['details']?></textarea>
                                                    </div> </div>
                                               
                                                  <div class="row align-items-center"> 
                                                 
                                                   
                                                <div class="mb-3"><label for="details" class="form-label">Amenities</label>
                                                      <div id="addAmenity" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="modal-body">
                                                    
                                                        
    <div class="mb-3">
                                                                <label for="newCitytoAdd" class="form-label">Add New Amenity</label>
                                                                <input class="form-control" type="text" required="" id="newAmenitytoAdd" placeholder="Enter new Amenity">
                                                            </div>
                                                            <div class="mb-2 text-center">
                                                                <button class="btn rounded-pill btn-primary" id="saveAmenity">Save</button>
                                                            </div>
    
                                                      
    
                                                    </div>
                                                </div><!-- /.modal-content -->
                                            </div><!-- /.modal-dialog -->
                                        </div><!-- /.modal -->
    
                                        
                                           <a href="#" style='float:right'  data-bs-toggle="modal" data-bs-target="#addAmenity">Add New</a>
                                           
                                                    <select multiple="multiple" class="multi-select" id="my_multi_select1" name="my_multi_select1[]" data-plugin="multiselect">
                                                 
<? $amn=DB::query("Select * from amenities WHERE ame_name<>'' ");
foreach($amn as $a){
                    echo "<option ";
                    if(strpos($as['amenities'], $a['ame_name']) !== false){ echo " selected ";}
                    echo "value='".$a['ame_name']."'>".$a['ame_name']."</option>";
} ?>
                                                </select>
                                                </div>
                                            

                                                    </div>
                                                  <div class="row align-items-center"> 
                                                    <div class="mb-3 col-auto">
                                                        <label for="contact_person" class="form-label">Contact Person</label>
                                                        <input type="text" id="contact_person" value="<?=$as['contact_person']?>" name="contact_person" class="form-control">
                                                    </div>
                                                      <div class="mb-3 col-auto">
                                                        <label for="contact_no" class="form-label">Contact No</label>
                                                        <input type="text" id="contact_no" name="contact_no" value="<?=$as['contact_no']?>" class="form-control">
                                                    </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <button id="SaveProperty" class="btn input-group-text btn-primary waves-effect waves-light" type="button">save</button>
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

 


        <script src="assets/libs/selectize/js/standalone/selectize.min.js"></script>
  
        <script src="assets/libs/multiselect/js/jquery.multi-select.js"></script>
        <script src="assets/libs/select2/js/select2.min.js"></script>
   
        <script src="assets/libs/bootstrap-maxlength/bootstrap-maxlength.min.js"></script>
        <!-- Init js-->
        <script src="assets/js/pages/form-advanced.init.js"></script>

        <!-- App js-->
        <script src="assets/js/app.min.js"></script>
        <script>
             $("#SaveProperty").click(function(){
                 var selectedValues = $('#my_multi_select1').val().toString();
                 var intRegex = /^\d+$/;
var floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;
                 
             if($("#purpose").val() == ''){alert('"Property On" cannot be Empty!');} else
                if($("#ptype").val() == ''){alert('Type cannot be Empty!');} else
                if($("#subtype").val() == ''){alert('Sub-type cannot be Empty!');} else
                if($("#city").val() == ''){alert('City cannot be Empty!');} else
                if($("#location").val() == ''){alert('Location cannot be Empty!');} else
                if($("#pname").val() == ''){alert('Property Title cannot be Empty!');} else
                if($("#psize").val() == ''){alert('Dimension cannot be Empty!');} else
                if(isNaN($("#psize").val())) { alert('Only Numbers allowed in size.!');} else
                if($("#unit").val() == ''){alert('Dimention Unit cannot be Empty!');} else
                if($("#did").val() == ''){alert('Developer cannot be Empty!');} else
                if($("#price").val() == ''){alert('Price cannot be Empty!');} else
                
                 if(isNaN($("#price").val())) { alert('Only Numbers allowed in price.!');} else
                if($("#unit1").val() == ''){alert('Price Unit cannot be Empty!');} else
                if($("#movein").val() == ''){alert('Possession cannot be Empty!');} else
                if($("#details").val() == ''){alert('Description cannot be Empty!');} else
                if(selectedValues == ''){alert('Amenities cannot be Empty!');} else
                if($("#contact_person").val() == ''){alert('Contact Person cannot be Empty!');} else
                if($("#contact_no").val() == ''){alert('Contact No. cannot be Empty!');}
                else {
                $.ajax({
                    type: "POST",  
                    url: "include/function_do.php?editProperty=<?=$_GET['pid']?>", 
                    data: {'purpose':$("#purpose").val(),'ptype':$("#ptype").val(),'subtype':$("#subtype").val(),'city':$("#city").val(),
                        'location':$("#location").val(),'sublocation':$("#sublocation").val(),'pname':$("#pname").val(),'psize':$("#psize").val(),
                        'unit':$("#unit").val(),'did':$("#did").val(),'price':$("#price").val(),'unit1':$("#unit1").val(),
                        'movein':$("#movein").val(),'details':$("#details").val(),'amenities':selectedValues,'contact_person':$("#contact_person").val(),
                        'contact_no':$("#contact_no").val()
                    },
                    dataType: "text",
                success: function (data) {
                data1=data.split("^");
                if(data1[1]=='Property Edited!'){ window.location.href = 'EditPropertyPictures.php?pid='+data1[0];} else {
                alert(data);}
        },  error: function(jqXhr, textStatus, errorMessage){
      console.log("Error: ", errorMessage);
   },
        
        cache: false,
                   
    });}
           });
            
            ////////add developers////
          
 $("#saveDeveloper").click(function(){
                if($("#newDevelopertoAdd").val() == ''){alert('Please select any picture!');} else
                if($("#dev_logo").val() == ''){alert('Please select developer logo!');} else
                if($("#descrition_dev").val() == ''){alert('Please add some Develeoper Details!');} 
                
                else {
               var formData = new FormData();
formData.append('file', $("#dev_logo")[0].files[0]);
formData.append('dname', $("#newDevelopertoAdd").val());
formData.append('ddetails', $("#descrition_dev").val());

$.ajax({
       url : 'include/function_do.php?addDeveloper=yes',
       type : 'POST',
       data : formData,
       processData: false,  // tell jQuery not to process the data
       contentType: false,
       enctype: 'multipart/form-data',// tell jQuery not to set contentType
       
        success: function (data) {
            if(data=="Developer Added!"){ window.location.href = 'addNewProperty.php';} else {
            alert(data);}
            
        },  error: function(jqXhr, textStatus, errorMessage){
      console.log("Error: ", errorMessage);
   },
        
        cache: false,
                   
    });}
            });
            /////// Add location////
    $("#saveLocation").click(function(e){
        e.preventDefault(e);
       
        var newLocationtoAdd = $("#newLocationtoAdd").val();
        var ncity = $("#ncity").val();
        $.ajax({
                    type: "POST",  
                    url: "include/function_do.php?newLocationtoAdd="+newLocationtoAdd+"&ncity="+ncity, 
                  dataType: "text",
                  data	: {'1':1},
                  success: function (data) {
                        if(data=='Location Added!'){ alert('Location added!');
                          window.location.href = 'addNewProperty.php';
                        } else {
                                                     alert(data);}},  
                  error: function(jqXhr, textStatus, errorMessage){
                            console.log("Error: ", errorMessage);
                        },
                  cache: false,
                   });
        });
        ////////Add City ////////
         $("#saveCity").click(function(e){
              e.preventDefault(e); 
        var newCitytoAdd = $("#newCitytoAdd").val();
        
        $.ajax({
                    type: "POST",  
                    url: "include/function_do.php?newCitytoAdd="+newCitytoAdd, 
                  dataType: "text",
                    data	: {'1':1},
                  success: function (data) {
                        if(data=='City Added!'){ alert('City added!');
                            window.location.href = 'addNewProperty.php';
                        } else {
                                                     alert(data);}},  
                  error: function(jqXhr, textStatus, errorMessage){
                            console.log("Error: ", errorMessage);
                        },
                  cache: false,
                   });
        });
        
        ////Update Location on City Change //////
        $("#city").change(function(e){
              e.preventDefault(e); 
        var selectedCity = $(this).val();
        $.get("include/function_do.php?selectedCity="+selectedCity, function(data, status){
      
                      $("#location").html(data); });
        });
        /////Update Subtype on Type change////
        $("#ptype").change(function(e){
              e.preventDefault(e); 
        var selectedType = $(this).val();
        $.get("include/function_do.php?selectedType="+selectedType, function(data, status){
      
                      $("#subtype").html(data); });
        });
        
        ////// Add Amenity /////
        
        $("#saveAmenity").click(function(e){
              e.preventDefault(e); 
        var newAmenitytoAdd = $("#newAmenitytoAdd").val();
        
        $.ajax({
                    type: "POST",  
                    url: "include/function_do.php?newAmenitytoAdd="+newAmenitytoAdd, 
                  dataType: "text",
                    data	: {'1':1},
                  success: function (data) {
                        if(data=='Amenity Added!'){ alert('Amenity added!');
                            window.location.href = 'addNewProperty.php';
                        } else {
                                                     alert(data);}},  
                  error: function(jqXhr, textStatus, errorMessage){
                            console.log("Error: ", errorMessage);
                        },
                  cache: false,
                   });
        });
        </script>
        
    </body>
</html>