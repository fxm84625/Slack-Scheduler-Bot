var google = require( 'googleapis' );
var calendar = google.calendar( 'v3' );
// var googleAuth = require( 'google-auth-library' );
var OAuth2 = google.auth.OAuth2;

if( !process.env.GOOGLE_CLIENT_ID ) { throw new Error( 'process.env.GOOGLE_CLIENT_ID not found' ); process.exit(1); return; }
if( !process.env.GOOGLE_CLIENT_SECRET ) { throw new Error( 'process.env.GOOGLE_CLIENT_SECRET not found' ); process.exit(1); return; }
if( !process.env.DOMAIN ) { throw new Error( 'process.env.DOMAIN not found' ); process.exit(1); return; }

var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var DOMAIN = process.env.DOMAIN;

var oauth2Client = new OAuth2( GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DOMAIN + '/connect/callback' );

module.exports = {
    generateAuthUrl( auth_id ) {
        var authObj = {
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                // 'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/plus.me'
            ]
        };
        if( auth_id ) {
            authObj.state = encodeURIComponent( JSON.stringify({ auth_id: auth_id }) );
        }
        return oauth2Client.generateAuthUrl( authObj );
    },
    getToken( code ) {
        return new Promise( function( resolve, reject ) {
            oauth2Client.getToken( code, function( codeGetError, tokens ) {
                if( codeGetError ) { reject( codeGetError ); return; }
                resolve( tokens );
            });
        });
    },
    createCalendarEvent( tokens, title, startDate, endDate ) {
        oauth2Client.setCredentials( tokens );
        return new Promise( function( resolve, reject ) {
            calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                resource: {
                    summary: title,
                    start: { date: startDate, timeZone: "America/Los_Angeles" },
                    end: { date: ( endDate ? endDate : startDate ), timeZone: "America/Los_Angeles" }
                }
            }, function( calendarInsertError, calendarInsertResponse ) {
                if( calendarInsertError ) { reject( calendarInsertError ); return }
                resolve( calendarInsertResponse );
            });
        });
    }
}