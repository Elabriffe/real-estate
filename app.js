//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

var data = {
    inf_prix: 0,
    Type: "",
    surface: 0,
    ville: "",
    Nbrepiece: 0,
    Classe_EN: "",
    m: 0,
    post: "",

};
var nomville = {
    prixcomp: '',
    message: '',
};


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    request( 'https://www.leboncoin.fr/ventes_immobilieres/1082335546.htm?ca=12_s', function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( body );
            {
                var price = $( 'span.value' );
                var pr = price.eq( 0 ).text().trim().split( ' ' );
                var pri = pr[0] + pr[1];
                var ty = $( 'span.value' );
                var typ = ty.eq( 2 ).text();
                var city = $( 'span.value[itemprop=address]' );
                var vi = city.text().split( ' ' );
                var nbr = $( 'span.value' );
                var nb = nbr.eq( 3 ).text();
                var su = $( 'span.value' );
                var surf = su.eq( 4 ).text();
                var cl = $( 'span.value' );
                var clas = cl.eq( 6 ).text();
                var po = vi[1].split( ' ' );
                var hab = parseFloat( pr[0] + pr[1] ) / parseFloat( surf );
                data = {
                    inf_prix: pri,
                    Type: typ,
                    ville: vi[0],
                    Nbrepiece: nb,
                    surface: surf,
                    Classe_EN: clas,
                    m: hab,
                    post: po,
                }

            }

            request( 'https://www.meilleursagents.com/prix-immobilier/' + data.ville.toLowerCase() + '-' + data.post, function ( error, response, body ) {
                if ( !error && response.statusCode == 200 ) {
                    var K = cheerio.load( body );
                    var b = K( 'div.small-4.medium-2.columns.prices-summary__cell--median' );
                    if ( data.Type == "Maison" ) {
                        var l = b.eq( 1 ).html().split( '&#xA0;' );
                        var n = parseInt( l[0] + l[1] );
                        if ( n > data.m ) {
                            var mess1 = "bon deal"
                        }
                        else if ( n < data.m ) {
                            var mess1 = "mauvais deal"
                        }
                        else {
                            var mess1 = "deal ok"
                        }
                        {
                            nomville = {
                                prixcomp: n,
                                message: mess1,
                            }
                        }
                    }

                    if ( data.Type == "Appartement" ) {
                        var l = b.eq( 0 ).html().split( '&#xA0;' );
                        var n = parseFloat( l[0] + l[1] );
                        if ( n > data.m ) {
                            var mess1 = "bon deal"
                        }
                        else if ( n < data.m ) {
                            var mess1 = "mauvais deal"
                        }
                        else {
                            var mess1 = "deal ok"
                        }
                        {
                            nomville = {
                                prixcomp: n,
                                message: mess1,
                            }
                        }
                    }
                }
            })
        }
    })
    res.render( 'home', {
        prix: data.inf_prix,
        type: data.Type,
        surface: data.surface,
        ville: data.ville,
        Nbrepiece: data.Nbrepiece,
        Classe_EN: data.Classe_EN,
        m: data.m,
        post: data.post,
        mess: nomville.message,
        deal: nomville.prixcomp,
    });
});





//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

