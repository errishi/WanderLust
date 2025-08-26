const Listing = require("../models/listing");
const maptilerClient = require('@maptiler/client');

const mapToken = process.env.MAP_TOKEN_API;

maptilerClient.config.apiKey = mapToken;

// maptilerClient.config.fetch = fetch;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    // in an async function, or as a 'thenable':
    const result = await maptilerClient.geocoding.forward(
        req.body.listing.location, {
        limit: 1,
    });

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = result.features[0].geometry;

    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.searchListing = async (req, res) => {
    let country = req.query.country || "";
    if (!country) {
        return res.redirect("/listings");
    }
    let split = country.trim().split(' '); // Remove extra spaces and split

    // Handle empty input or single-word input gracefully
    let firstWordCapitalized = "", secondWordCapitalized = "", result = "";

    if (split.length >= 2 && split[0] && split[1]) {
        firstWordCapitalized = split[0][0].toUpperCase() + split[0].slice(1);
        secondWordCapitalized = split[1][0].toUpperCase() + split[1].slice(1);
        result = firstWordCapitalized + " " + secondWordCapitalized;
    } else if (split.length === 1 && split[0]) {
        // Only one word entered, capitalize it
        firstWordCapitalized = split[0][0].toUpperCase() + split[0].slice(1);
        result = firstWordCapitalized;
    } else {
        // Handle empty input
        // You may want to set result to "" or return an error/render a message
        result = "";
    }

    const countryList = await Listing.find({ country: `${result}` });

    if (!countryList || countryList.length === 0) {
        // No matches found
        req.flash("error", "Listing does not exist, try again..");
        return res.redirect("/listings");
    }

    res.render("listings/category.ejs", { countryList });
}