exports.homePage = (req, res) => {
    console.log('====================================');
    console.log("Name: " + req.name);
    console.log('====================================');
    res.render("index");
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add store' });
}

exports.createStore = ( req, res ) => {
    res.json( req.body );
}