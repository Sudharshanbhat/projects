var a=prompt("Please enter A:");
var b=prompt("Please enter B:");
console.log(parseInt(a) + parseInt(b))





function myFunction() {
    document.getElementById("id1").innerHTML = "Welcome to my website!";
    var img = document.getElementById("img1");
    if (img.src.includes("ahmetyuksek-swan-close-up-9767494_1920.jpg")) {
        img.src = "images/nunziog666-mountains-10253276_1920.jpg";
    } else {
        img.src = "images/ahmetyuksek-swan-close-up-9767494_1920.jpg";
    }

}
function switchSize() {
    var img = document.getElementById("img1");
    if (img.width === 250) {
        img.width = 500;
        img.height = 600;
    } else {
        img.width = 250;
        img.height = 300;
    }
}
