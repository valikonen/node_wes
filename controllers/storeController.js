const mongoose = require("mongoose");
const Store = mongoose.model('Store');

const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        
        const isPhoto = file.mimetype.startsWith('image/');

        if(isPhoto) {
            next(null, true);
        }
        else {
            next({ message: 'That filetype isn\'t allowed'}, false);
        }
    }
}

exports.homePage = (req, res) => {
    res.render("index");
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    //check if the is no new file to resize
    if(!req.file){
        next() //skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // now resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);;
    await photo.write(`./public/uploads/${req.body.photo}`);
    console.log(req.file);
    // once we have written to our filesystem, keep going!
    next();
}

exports.createStore = async ( req, res ) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {

    // 1. Query to the DB for the list of stores
    const stores = await Store.find();

    res.render('stores', { title: 'Store', stores: stores });

}

exports.editStore = async (req, res) => {
    // 1. Find the store given ID
    const store = await Store.findOne({ _id: req.params.id });    
    // 2. Confirm that you're the owner of the store
    // TODO
    // 3. Render out the edit form so the user can update store
    res.render('editStore', { 
        title: `Edit store ${store.name}`,
        store: store 
    });
}

exports.updateStore = async (req, res) => {
    // Set the location data to be a point
    req.body.location.type = 'Point';
    // Find and update correct store
    const store = await Store.findOneAndUpdate({
        _id: req.params.id
        }, req.body, {
        new: true, // return the new store instead of the old one
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong> <a href="/stores/${store.slug}"> View Store</a>`)
    // Redirect then the store and tell tem it worked
    res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
   const store = await Store.findOne({ slug: req.params.slug });
   if(!store) return next();
   res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };

    const tagsPromise = await Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });

    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    
    res.render('tags', { title: 'Tags', tags, tag, stores });
}
