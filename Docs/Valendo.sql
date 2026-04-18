-- 1. Tabela de Usuários
CREATE TABLE users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  tag           VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  global_xp     INT NOT NULL DEFAULT 0
);

-- 2. Tabela de Salas (1 User : N Rooms)
CREATE TABLE rooms (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       CHAR(6) NOT NULL UNIQUE,
  host_id    BIGINT  NOT NULL,
  theme      VARCHAR(255),
  status     VARCHAR(20) NOT NULL CHECK (status IN ('waiting','playing','finished')),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_rooms_host FOREIGN KEY (host_id) REFERENCES users(id)
);

-- 3. Tabela de Duelos (Room 1 : 1 Duel ativo)
CREATE TABLE duels (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id      BIGINT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_rounds INT NOT NULL,
  CONSTRAINT fk_duels_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 4. Tabela de Perguntas (Duel 1 : N Questions)
CREATE TABLE questions (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  duel_id        BIGINT NOT NULL,
  text           TEXT NOT NULL,
  options        JSONB NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  explanation_ai TEXT,
  CONSTRAINT fk_questions_duel FOREIGN KEY (duel_id) REFERENCES duels(id)
);

-- 5. Tabela de Respostas (User N : N Question via Answer)
CREATE TABLE answers (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT NOT NULL,
  question_id      BIGINT NOT NULL,
  selected_option  VARCHAR(255) NOT NULL,
  is_correct       BOOLEAN NOT NULL,
  response_time_ms INT,
  CONSTRAINT fk_answers_user     FOREIGN KEY (user_id)     REFERENCES users(id),
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT uq_answers_user_question UNIQUE (user_id, question_id)
);

-- 6. Tabela de Ranking Semanal (User 1 : N WeeklyScore)
CREATE TABLE weekly_scores (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  week_number INT NOT NULL,
  points      INT NOT NULL DEFAULT 0,
  division    VARCHAR(50),
  CONSTRAINT fk_weekly_scores_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uq_weekly_scores_user_week UNIQUE (user_id, week_number)
);

-- 7. Tabela de Amizades (User N : N User auto-relacionamento)
CREATE TABLE friendships (
  user_id_1 BIGINT NOT NULL,
  user_id_2 BIGINT NOT NULL,
  status    VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id_1, user_id_2),
  CONSTRAINT fk_friendships_user1 FOREIGN KEY (user_id_1) REFERENCES users(id),
  CONSTRAINT fk_friendships_user2 FOREIGN KEY (user_id_2) REFERENCES users(id),
  CONSTRAINT ck_friendships_order CHECK (user_id_1 < user_id_2)
);
