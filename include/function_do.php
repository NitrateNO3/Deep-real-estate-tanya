<? include '../admin/include/MeecroDB.php';
$to= $toMail;
if(isset($_GET['mkey'])){
    $gh=DB::query("SELECT * FROM maps WHERE map_name LIKE %ss GROUP BY map_name", $_GET['mkey']);
    $jk='';$count= DB::count();
    if($count >= 1){ $t=1;
    foreach($gh as $h){
        $jk .='<div class="col-xs-6 col-sm-3 col-md-3">
                        <div class="featured-properties text-left">
                            <figure class="featured-image">
                                <a href="MapDetails.php?mid='.$h['mid'].'">
                                    <img src="admin/assets/maps/thumb/'.htmlspecialchars($h['thumb_url'], ENT_QUOTES).'" alt="'.htmlspecialchars($h['map_name'], ENT_QUOTES).'">
                                    <span class="overlay-1"></span>
                                </a>
                            </figure>
                            <h5><a href="MapDetails.php?mid='.urlencode($h['mid']).'">'.htmlspecialchars($h['map_name'], ENT_QUOTES).'</a></h5>
                        </div>
                    </div>';
       
        $t++;
    }
    echo $jk;} else {echo "NO Map Found!!!";}
} else if(isset($_GET['dockey'])){
    $gh=DB::query("SELECT * FROM documents WHERE dname LIKE %ss OR dpath LIKE %ss GROUP BY dname", $_GET['dockey'], $_GET['dockey']);
    $jk='';
    if(DB::count()){ $t=1;
    foreach($gh as $h){
        $fileType=pathinfo(basename($h['dpath']), PATHINFO_EXTENSION);
                            if($fileType='doc' || $fileType='docx'  ){$ext='docx.png';} else
                            if($fileType='pdf'  ){$ext='pdf.png';} else
                            if($fileType='xls' || $fileType='xlsx'  ){$ext='xls.png';} 
        $jk .=$h['d_id']."^".$h['dname']."^".$h['dcat']."^".$h['dpath']."^".$ext;
        if(count($gh) > $t){ echo $jk .="hjhjhj";}
        $t++;
    }
    echo $jk;} else {$jk='No Doc found!!';}
} else if(isset($_GET['getdev'])){
    $gh=DB::query("SELECT * FROM developers WHERE name LIKE %ss", $_GET['getdev']);
    $jk='';
    if(DB::count()){ $t=1;
    foreach($gh as $d){
       
        $jk .= '<div class="col-xs-6 col-sm-6 col-md-3">
                        <div class="agent">
                            <figure>
                                <a href="DevelopersDetails.php?did='.$d['did'].'" target="_blank">
                                    <img src="admin/assets/uploadedDevelopersLogo/'.$d['logo'].'">
                                    <span class="overlay-1"></span>
                                </a>
                            </figure>
                            <div class="agents-details text-left">
                                <h6><a href="DevelopersDetails.php?did='.$d['did'].'"  target="_blank">'.$d['name'].'</a></h6>
                             
                                
                            </div>
                        </div>
                    </div>';
    }
    echo $jk;} else {$jk='No Dev found!!';}
} else if(isset($_GET['emailForDoc'])){
    if(mail($to,'Someone downloaded a doc.',$_GET['emailForDoc'].' has downloaded the doc. '.$_GET['file'],$headers))
    {echo 1;} else {echo 0;}
    
} else if(isset($_GET['doContact'])){
    $message="
    <table>
    <tr><th>Name</th><td>".$_POST['fname']."</td></tr>
    <tr><th>Mobile No.</th><td>".$_POST['mobile']."</td></tr>
    <tr><th>Email Id</th><td>".$_POST['emailid']."</td></tr>
    <tr><th>Subject</th><td>".$_POST['subject']."</td></tr>
    <tr><th>Message</th><td>".$_POST['message']."</td></tr>
    <tr><th></th><td></td></tr>
    </table>
    ";
    if(mail($to,'Contact: Website (deepreal) Contact initiated!',$message,$headers))
    {echo 1;} else {echo 0;}
    
} else if(isset($_GET['doPropEnq'])){
 
    $message="
    <table>
    <tr><th>Name</th><td>".$_POST['fname']."</td></tr>
    <tr><th>Mobile No.</th><td>".$_POST['mobile']."</td></tr>
    <tr><th>Email Id</th><td>".$_POST['emailid']."</td></tr>
    <tr><th>Property ID</th><td><a href='https://deeprealestate.in/PropertiesDetails.php?pid=".$_POST['pid']."' target='_blank'>".$_POST['pname']."</a></td></tr>
    <tr><th>Message</th><td>".$_POST['message']."</td></tr>
    <tr><th></th><td></td></tr>
    </table>
    ";
    if(mail($to,'Enquiry: Website (deepreal) Enquiry initiated!',$message,$headers))
    {echo 1;} else {echo 0;}
    
}  else if(isset($_GET['doLatestUpdate'])){
    $message= $_POST['emailid']." wants to receive latest updates on email. Please keep him posted for new updates.
    ";
    if(mail($to,'Latest Update Request!',$message,$headers))
    {echo 1;} else {echo 0;}
}
else if(isset($_GET['sendQuickEnq'])){
    $pname=$_POST['pname'];
    $pemail=$_POST['pemail'];
    $pphone=$_POST['pphone'];
    $pmsg=$_POST['pmsg'];
    $msg="<table>
    <tr><td>Name</td><td>$pname</td></tr>
    <tr><td>Email</td><td>$pemail</td></tr>
    <tr><td>Phone</td><td>$pphone</td></tr>
    <tr><td>Message</td><td>$pmsg</td></tr>
    </table>";
    DB::query("INSERT INTO req_post(name, cno, email, comments) 
    VALUES ('$pname','$pphone','$pemail','$pmsg')");
    mail($to,'New Quick Enquiry',$msg,$headers);
    echo 1;
    
}
