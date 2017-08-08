exports.homePage = (req, res) => {
    console.log('====================================');
    console.log("Name: " + req.name);
    console.log('====================================');
    res.render("index");
}