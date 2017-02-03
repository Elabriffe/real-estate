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
    m: 0,
    post: "",

};
var nomville = {
    prixcomp: '',
    message: '',
};



//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    var url = req.query.urlLBC;
    if ( url ) {
        request( url, function ( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
                var $ = cheerio.load( body );
                {

                    $( 'h2.item_price.clearfix span.value' ).each( function ( i, element ) {
                        var tit = $( this )
                        var pr = tit.text().trim().split( ' ' );
                        data.inf_prix = pr[0] + pr[1];
                    }
                    );

                    $( 'h2.clearfix span.property' ).each( function ( i, element ) {
                        var ty = $( this );
                        if ( ty.text() == "Type de bien" )
                            data.Type = ty.next().text();
                    });

                    var city = $( 'span.value[itemprop=address]' );
                    var vi = city.text().split( ' ' );
                    var po = vi[1];

                    $( 'h2.clearfix span.property' ).each( function ( i, element ) {
                        var nbr = $( this );
                        if ( nbr.text() == "Pi�ces" ) {
                            data.Nbrepiece = nbr.next().text();
                        }
                    });

                    $( 'h2.clearfix span.property' ).each( function ( i, element ) {
                        var su = $( this );
                        if ( su.text() == "Surface" ) {
                            data.surface = su.next().text();
                        }
                    });
                    var hab = parseFloat( data.inf_prix ) / parseFloat( data.surface );
                    data = {
                        inf_prix: data.inf_prix,
                        Type: data.Type,
                        ville: vi[0],
                        Nbrepiece: data.Nbrepiece,
                        surface: data.surface,
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
                        res.render( 'home', {// on met  le res.render() dans le premier if pour pas avoir à raffraichir le lien.
                            prix: data.inf_prix,
                            type: data.Type,
                            surface: data.surface,
                            ville: data.ville,
                            Nbrepiece: data.Nbrepiece,
                            m: data.m,
                            post: data.post,
                            mess: nomville.message,
                            deal: nomville.prixcomp,
                        });
                    }
                })

            }
        })
    }
    else {
        res.render( 'home', {// on met  le res.render() dans le premier if pour pas avoir à raffraichir le lien.
            prix: data.inf_prix,
            type: data.Type,
            surface: data.surface,
            ville: data.ville,
            Nbrepiece: data.Nbrepiece,
            m: data.m,
            post: data.post,
            mess: nomville.message,
            deal: nomville.prixcomp,
        });
    }
});





//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

