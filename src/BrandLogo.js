import React from "react";
import brandLogo from "./img/Logo.png";
import { Typography } from "@material-ui/core";
import { useStyles } from "./authentication/Menu";

function BrandLogo(props) {
    const classes = useStyles()

    return (
        <>
            <img src={brandLogo} alt="brand logo" width={props.width ? props.width : 300}
                height={props.height ? props.height : 300} className={classes.media}
                style={{ display: 'flex', justifyContent: 'center' }} />
            <Typography variant="h2" className={classes.brandName} style={{ display: 'flex', justifyContent: 'center' }}>
                
            </Typography>
        </>
    )
}

export default BrandLogo;