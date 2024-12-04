import React from 'react';
import './Profile.css';
import firebase from 'firebase/app';
import {useCollection} from 'react-firebase-hooks/firestore';
import {useLocation} from 'react-router-dom';
import {Box, Grid} from "@material-ui/core";
import HomeListingCard from "./listingCard";

const firestore = firebase.firestore();
var target, targetID, targetName, targetPhoto;

var listings = [];
var docsID = [];

function SellerProfile() {
    target = useLocation().state[0].targetUserName;
    targetID = useLocation().state[0].targetUserID;

    var [targetSeller, loadingSeller] = useCollection(firestore.collection('users').where("ID", "==", targetID));

    if (!loadingSeller) {
        targetSeller.forEach(targetSeller => {
            targetName = targetSeller.data().Name;
            targetPhoto = targetSeller.data().photoURL;
        })
    }

    // Getting the listings from the database.
    const listingsRef = firestore.collection('listings');
    const query = listingsRef.orderBy('createdAt', "desc"); // ordering by time
    // retrieving them

    const [listingsBig, loading] = useCollection(query);

    // check if data is still being loaded
    if (!loading) {
        // make sure to take most recent posts
        var index = 0;
        listingsBig.forEach(doc => {
            listings[index] = doc.data();
            docsID[index] = doc.id;
            index++;
        })

    }

    const getListingCard = (listingObj, iD) => {
        let props = {
            listingObj: listingObj,
            iD: iD,
        }

        return (
            <Grid item>
                <HomeListingCard {...props} />
            </Grid>
        )
    }


    return (
        <div className="container">
            <div className="about">
                {targetSeller ?
                    <>
                        <img className="profilePicture" src={targetPhoto}/>
                        <h1>{targetName}</h1>
                        <p>Otra información va aquí</p>
                    </>
                    :
                    <></>
                }
            </div>

            <div className="listings">
                <h1>Los listados necesitan que el campo "Vendedor" contenga el ID de usuario de su propietario.</h1>
                <h2>Esto para que podamos mostrar solo los listados creados por este usuario.</h2>
                <p>Actualmente se muestran todos los listados posibles por ahora</p>
                {targetSeller ?
                    <Box p={1} m={1}>
                        <Grid container justify="center" spacing={4}>
                            {listings.map((listingObj, index) =>
                                getListingCard(listingObj, docsID[index])
                            )}
                        </Grid>
                    </Box>

                    :
                    <p>El usuario no tiene anuncios</p>
                }
            </div>
        </div>

    )
}

export default SellerProfile;