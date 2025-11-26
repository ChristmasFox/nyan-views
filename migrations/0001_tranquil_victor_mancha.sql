CREATE TABLE "display"
(
    "id"          serial PRIMARY KEY      NOT NULL,
    "displayName" varchar(256),
    "displayData" text,
    "updated_at"  timestamp DEFAULT now() NOT NULL,
    "created_at"  timestamp DEFAULT now() NOT NULL
);
