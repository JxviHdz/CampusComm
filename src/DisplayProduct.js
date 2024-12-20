import React, {useState} from 'react';
import firebase, {auth} from './firebase';
import {useCollection} from 'react-firebase-hooks/firestore';
import {useAuthState} from "react-firebase-hooks/auth";
import {useHistory} from 'react-router-dom';
import {Box, Button, Dialog, Divider, Grid, Paper, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import emptyFrame from "./img/emptyFrame.png"

const firestore = firebase.firestore();

const useStyles = makeStyles((theme) => ({
    container: {
        margin: "30px",
        marginBottom: "100px",
    },
    media: {
        display: 'flex',
        justifyContent: 'center',
        objectFit: "cover",
    },
    noButton: {
        color: theme.palette.action.disabled,
        borderColor: theme.palette.action.disabled,
    },
    yesButton: {
        color: red[200],
        borderColor: red[200],
    },
    secondPaper: {
        backgroundColor: theme.palette.background.paper2,
    },
    emptyFrame: {
        width: "120px",
        height: "120px",
    },
    smallImages: {
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderStyle: "solid",
        borderColor: theme.palette.secondary.main,
        borderWidth: "2px"
    },
}));

var globalID = null;
var globalUserID = null;
var sellerID = null;
var oldVal = "";

function DisplayProduct(props) {
    let id = props.location.state.iD;
    globalID = id;
    const [user] = useAuthState(auth);
    var userID = null;
    var match = false;
    var msg = "Loading";
    var gotoSeller = "Loading";
    if (user != null) {
        userID = user.uid;
    }
    globalUserID = userID;

    const history = useHistory();
    const classes = useStyles();

    // Getting the listings from the database.
    const listingsRef = firestore.collection('listings').doc(id);
    var [document, loading] = useCollection(listingsRef);

    var listingName = "Loading", listingDes = "Loading", listingPrice = "Loading", listingSeller = "Loading", listingTags = [];
    var listingUrl = [];
    var userName = "Loading";
    var myListing = null;
    var path = "";
    var userPath = "";
    var state = [];
    var stateMyProduct = [];
    var stateMsg = [];
    var sold = false;
    var listingExtraUrls = []
    var allImages = []

    if (!loading && (myListing = document.data()) !== undefined) {
        listingName = myListing.name;
        listingDes = myListing.description;
        listingSeller = myListing.seller;
        listingPrice = myListing.price;
        listingUrl = [myListing.imgUrl];
        listingTags = myListing.categories;
        listingExtraUrls = myListing.allPhotos;
        oldVal = myListing.interestedUsers;
        allImages = listingUrl.concat(listingExtraUrls)
        if (oldVal == null) oldVal = "";
        sold = myListing.sold;
        if (sold == null) sold = "false";
    } else {

    }

    var userRef = firestore.collection('users').where("ID", "==", listingSeller);
    var [trueSeller, loadingSeller] = useCollection(userRef);
    var SellerID;
    if (!loadingSeller) {
        trueSeller.forEach(seller => {
            userName = seller.data().Name;
            SellerID = seller.data().ID;
            sellerID = SellerID;
        })
    }


    if (listingSeller == userID) {
        msg = "Edit details";
        gotoSeller = "Go to My Profile"
        match = true;
        path = "/product"
        userPath = "/Profile"
        stateMyProduct = {
            iDListing: id,
            name: listingName,
            description: listingDes,
            price: listingPrice,
            url: listingUrl[0],
            extraUrls: listingExtraUrls,
            categories: listingTags,
        }
        state = {
            targetUserID: SellerID,
            currentUserID: userID
        }
    } else {
        msg = "Message Seller";
        gotoSeller = "Go to Seller Profile";
        userPath = "/Profile";
        path = "/ChatRoom";
        stateMyProduct = {
            targetUserName: userName,
            targetUserID: SellerID,
            myUID: userID,
            interestedProduct: listingName,
        }
        state = {
            targetUserID: SellerID,
            currentUserID: userID
        }
    }

    const updateInterested = () => {
        var newVal = "";
        if (oldVal == null || oldVal == "") {
            newVal = globalUserID;
        } else {
            if (oldVal.includes(globalUserID)) {
                if (oldVal.includes("," + globalUserID)) var toRemove = "," + globalUserID;
                else var toRemove = globalUserID;
                newVal = oldVal.replace(toRemove, "");
            } else {
                newVal = oldVal + "," + globalUserID;
            }
        }

        firestore.collection('listings').doc(globalID).update({
            interestedUsers: newVal
        })
    }

    function SimpleDialog(props) {
        const {onClose, selectedValue, open} = props;

        const handleClose = () => {
            onClose(selectedValue);
        };


        return (
            <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                <Box justifyContent="center" m={1} p={1}>
                    <img src={listingUrl} alt='react logo' className='productImage'/>
                </Box>
            </Dialog>
        );
    }

    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(listingUrl);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    function setBigImage(index) {
        if (allImages[index] !== undefined) {
            setSelectedImageIndex(index)
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };

    let smallImages = []

    for (let i = 0; i < 6; ++i) {
        smallImages.push(
            <Grid item xs={6} sm={4}>
                <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                    <img src={allImages !== [] && allImages[i] !== undefined ? allImages[i] : emptyFrame}
                         className={allImages !== [] && allImages[i] !== undefined ? classes.smallImages : classes.emptyFrame}
                         style={{borderRadius: `${i === selectedImageIndex ? "16px" : "3px"}`}}
                         onClick={() => {
                             setBigImage(i)
                         }} alt="Primary Image"/>
                </Box>
            </Grid>
        )
    }

    return (
        <>
            <Box p={1} m={1}
                 className={classes.container}
            >
                <Paper>
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                    variant="h1"
                                    style={{fontSize: 36, display: 'inline-block'}}
                                >
                                    {listingName}
                                </Typography>
                                <Typography
                                    variant="h2"
                                    style={{fontSize: 28, display: 'inline-block'}}
                                    align="right"
                                >
                                    £{listingPrice}
                                </Typography>
                            </Box>
                            <Divider variant="middle"/>
                            <Box display="flex" justifyContent="center" alignItems="center" >
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} lg={4}>
                                    <Box p={3} display="flex" justifyContent="center" alignItems="center">
                                        <img src={allImages !== [] ? allImages[selectedImageIndex] : emptyFrame}
                                             style={{
                                                 width: "400px", height: "400px",
                                                 objectFit: "scale-down",
                                             }}/>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4}>
                                    <Box display="flex" justifyContent="space-evenly" justifyItems="center" alignItems="center" flexWrap="wrap">
                                        <Grid container spacing={1}>
                                            {smallImages}
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                    <Box display="flex" justifyContent="space-around" alignItems="center" flexWrap="wrap"
                                         m={2} p={2}>
                                        <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="center" alignItems="center"
                                                 flexDirection="column">
                                                {globalUserID !== sellerID ?
                                                    <>{sold === "false" ?
                                                        <Button onClick={updateInterested}
                                                                variant="outlined"
                                                                color="primary"
                                                        >
                                                            {oldVal.includes(globalUserID) ?
                                                                "Cancel request"
                                                                :
                                                                "Request to buy"
                                                            }
                                                        </Button>
                                                        :
                                                        <Typography
                                                            variant="h2"
                                                            style={{fontSize: 24, marginBottom: "10px"}}
                                                        >
                                                            Sorry, this listing has been sold.
                                                        </Typography>
                                                    }</>
                                                    :

                                                    <Typography
                                                        variant="h2"
                                                        style={{fontSize: 24, marginBottom: "10px"}}
                                                    >
                                                        Lo sentimos, no puedes comprar tu propio anuncio.
                                                    </Typography>
                                                }
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => {
                                                        history.push(path, stateMyProduct)
                                                    }}
                                                >
                                                    {msg}
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>

                                            <Box display="flex" justifyContent="center" alignItems="center"
                                                 flexDirection="column">
                                                <Typography
                                                    variant="h2"
                                                    style={{fontSize: 24, marginBottom: "10px"}}
                                                >
                                                    Vendedor: {userName}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => {
                                                        history.push(userPath,
                                                            state)
                                                    }}
                                                >
                                                    {gotoSeller}
                                                </Button>
                                            </Box>
                                        </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                            </Grid>
                            </Box>
                            <Divider variant="middle"/>
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                                <Grid item xs={12}>
                                    <Paper elevation={3} className={classes.secondPaper}>
                                        <Box p={3}>
                                            <Typography
                                                variant="h2"
                                                style={{fontSize: 24, marginBottom: "10px"}}
                                            >
                                                Descripcion:
                                            </Typography>
                                            <Divider variant="fullWidth"/>
                                            <Typography variant="body2" color="textSecondary"
                                                        style={{marginTop: "10px", whiteSpace: 'pre-line'}}>
                                                {listingDes}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Box>

                         <Box p={3}>
                             <Box display="flex" justifyContent="space-between" alignItems="center">
                                 <Typography variant="body2" color="textSecondary"
                                 >
                                     Etiquetas:
                                 </Typography>
                             </Box>
                             <Box display="flex" justifyContent="space-between" alignItems="center">
                             <Typography variant="body2" color="textSecondary"
                                         >
                                 {listingTags.join(", ")}
                             </Typography>
                             </Box>
                         </Box>

                        </Paper>
            </Box>
        </>
    )
}

export default DisplayProduct;
