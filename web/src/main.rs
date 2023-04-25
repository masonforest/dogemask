use actix_cors::Cors;
use actix_session::{
    config::PersistentSession, storage::CookieSessionStore, Session, SessionMiddleware,
};
use actix_web::http::header;
use actix_web::web::Data;
use actix_web::Responder;
use actix_web::{
    cookie::{self, Key},
    middleware::Logger,
    web, App, HttpRequest, HttpResponse, HttpServer, Result,
};
use base64::{engine::general_purpose, Engine as _};
use dotenv::dotenv;
use oauth2::basic::BasicClient;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge, RedirectUrl,
    Scope, TokenUrl,
};
use rand::RngCore;
use serde::Deserialize;
use serde_json::json;
use std::env;

struct AppState {
    oauth: BasicClient,
}

#[derive(Deserialize)]
pub struct AuthRequest {
    code: String,
    state: String,
}

#[derive(Deserialize)]
pub struct RedirectRequest {
    address: String,
}

async fn auth(
    session: Session,
    data: web::Data<AppState>,
    params: web::Query<AuthRequest>,
    _req: HttpRequest,
) -> Result<HttpResponse> {
    let expected_csrf_token = session.get::<[u8; 32]>("csrf").unwrap().unwrap();
    let code = AuthorizationCode::new(params.code.clone());
    let (csrf_token, _address) = params.state.split_at(64);
    if csrf_token.ne(&hex::encode(&expected_csrf_token[..])) {
        return Ok(HttpResponse::Unauthorized().finish());
    }

    let _token = &data.oauth.exchange_code(code);

    let html = include_str!("auth.html");
    Ok(HttpResponse::Ok().body(html))
}

async fn redirect(
    session: Session,
    data: web::Data<AppState>,
    params: web::Query<RedirectRequest>,
    _req: HttpRequest,
) -> Result<HttpResponse> {
    let mut csrf = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut csrf);
    session.insert("csrf", csrf)?;
    let (pkce_code_challenge, _pkce_code_verifier) = PkceCodeChallenge::new_random_sha256();

    let (authorize_url, _csrf_state) = &data
        .oauth
        .authorize_url(|| CsrfToken::new([hex::encode(csrf), "Address".to_string()].concat()))
        .add_scope(Scope::new("users.read".to_string()))
        .set_pkce_challenge(pkce_code_challenge)
        .url();

    session.insert("address", params.address.clone())?;

    Ok(HttpResponse::Found()
        .append_header((header::LOCATION, authorize_url.to_string()))
        .finish())
}

async fn get_session_address(
    _session: Session,
    _data: web::Data<AppState>,
    _req: HttpRequest,
) -> Result<impl Responder> {
    if let Some(address) = _session.get::<String>("address").unwrap() {
        Ok(HttpResponse::Ok().json(web::Json(json!(
            {
                "address": address
            }
        ))))
    } else {
        Ok(HttpResponse::Ok().json(web::Json(json!(
            {
                "badSession": 1
            }
        ))))
        
        // Ok(HttpResponse::Unauthorized().finish())
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    log::info!("starting HTTP server at http://localhost:3031");
    let key = Key::derive_from(
        &general_purpose::STANDARD_NO_PAD
            .decode(env::var("COOKIE_MASTER_KEY").expect("COOKIE_MASTER_KEY not set"))
            .expect("invalid bas64 key"),
    );
    let oauth_callback_url = env::var("OAUTH_CALLBACK_URL").expect("Missing OAUTH_CALLBACK_URL.");
    println!("OAUTH_CALLBACK_URL: {}", oauth_callback_url);
    let twitter_client_id = ClientId::new(
        env::var("TWITTER_CLIENT_ID").expect("Missing the TWITTER_CLIENT_ID environment variable."),
    );
    let twitter_client_secret = ClientSecret::new(
        env::var("TWITTER_CLIENT_SECRET")
            .expect("Missing the TWITTER_CLIENT_SECRET environment variable."),
    );
    let auth_url = AuthUrl::new("https://twitter.com/i/oauth2/authorize".to_string())
        .expect("Invalid authorization endpoint URL");
    let token_url = TokenUrl::new("https://api.twitter.com/2/oauth2/token".to_string())
        .expect("Invalid token endpoint URL");

    let client = BasicClient::new(
        twitter_client_id,
        Some(twitter_client_secret),
        auth_url,
        Some(token_url),
    )
    .set_redirect_url(
        RedirectUrl::new(oauth_callback_url).expect("Invalid redirect URL"),
    );

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials()
            .max_age(3600);
        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .wrap(
                SessionMiddleware::builder(CookieSessionStore::default(), key.clone())
                    .cookie_secure(false)
                    .session_lifecycle(
                        PersistentSession::default().session_ttl(cookie::time::Duration::hours(2)),
                    )
                    .build(),
            )
            .app_data(Data::new(AppState {
                oauth: client.clone(),
            }))
            .service(web::resource("/auth").to(auth))
            .service(
                web::resource("/")
                    .route(
                        web::get()
                            .guard(actix_web::guard::Header("content-type", "application/json"))
                            .to(get_session_address)
                    )
                    .route(web::get().to(redirect))
            )
            .service(actix_files::Files::new("", "web/public").show_files_listing())
    })
    .bind("0.0.0.0:8088")?
    .run()
    .await
}
