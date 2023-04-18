use std::sync::{Arc, Mutex};

use std::sync::MutexGuard;

#[derive(sqlx::FromRow)]
pub struct Site {
    domain: String,
}

pub async fn select_all(pool: sqlx::PgPool) -> Result<Vec<Site>, sqlx::Error> {
    sqlx::query_as("SELECT 'test'").fetch_all(&pool).await
}

#[derive(Clone)]
pub struct Context {
    pub count: Arc<Mutex<i32>>,
}

impl Context {
    pub fn count(self: &Context) -> i32 {
        let count: MutexGuard<i32> = self.count.lock().unwrap();
        count.clone()
    }

    pub fn increment_count(self: &Context) {
        let mut count: MutexGuard<i32> = self.count.lock().unwrap();
        *count += 1;
    }
}
