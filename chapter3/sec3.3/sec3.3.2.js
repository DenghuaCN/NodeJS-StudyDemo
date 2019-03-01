// sec3.3.2.js
function Hello() {
    var name;
    this.num = 10;

    this.setName = function (thyName) {
        name = thyName;
    }
    this.sayHello = function () {
        console.log("Hello " + name);
    }
    this.test = function() {
        console.log(this);
    }
}

module.exports = Hello;
