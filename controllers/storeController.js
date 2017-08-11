const mongoose = require("mongoose");
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render("index");
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add store' });
}

exports.createStore = async ( req, res ) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {

    // 1. Query to the DB for the list of stores
    const stores = await Store.find();
    console.log(stores); 

    res.render('stores', { title: 'Store', stores: stores });

}
