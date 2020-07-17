const pool = require('./pool');
const { apiLogger } = require('../api/services/logger');

module.exports = async function initTableUPW() {
  await pool.query(`CREATE TABLE IF NOT EXISTS  public.upws
  (
      data_standard integer,
      doi character varying COLLATE pg_catalog."default" NOT NULL,
      doi_url character varying COLLATE pg_catalog."default",
      genre character varying COLLATE pg_catalog."default",
      is_paratext boolean,
      is_oa boolean,
      journal_is_in_doaj boolean,
      journal_is_oa boolean,
      journal_issns character varying COLLATE pg_catalog."default",
      journal_name character varying COLLATE pg_catalog."default",
      oa_locations json[],
      best_oa_location json,
      oa_status character varying COLLATE pg_catalog."default",
      published_date character varying COLLATE pg_catalog."default",
      publisher character varying COLLATE pg_catalog."default",
      title character varying COLLATE pg_catalog."default",
      updated character varying COLLATE pg_catalog."default",
      year character varying COLLATE pg_catalog."default",
      z_authors json[],
      journal_issn_l character varying COLLATE pg_catalog."default",
      "createdAt" date,
      "updatedAt" date,
      CONSTRAINT upw_pkey PRIMARY KEY (doi)
  )
  TABLESPACE pg_default;

  ALTER TABLE public.upws
      OWNER to postgres;`)
    .then(() => apiLogger.info('Table upws exists'))
    .catch((err) => apiLogger.error(err));

  pool.end();
};
