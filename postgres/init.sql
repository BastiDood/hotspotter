CREATE EXTENSION IF NOT EXISTS h3;
CREATE SCHEMA hotspotter
    CREATE TABLE cdma(
        cdma_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT NOT NULL,
        asu SMALLINT CHECK(asu IN (1, 2, 4, 8, 16)),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        cdma_dbm SMALLINT NOT NULL,
        cdma_ecio SMALLINT NOT NULL,
        cdma_level SMALLINT NOT NULL CHECK(cdma_level BETWEEN 0 AND 4),
        evdo_dbm SMALLINT NOT NULL,
        evdo_ecio SMALLINT NOT NULL,
        evdo_level SMALLINT NOT NULL CHECK(cdma_level BETWEEN 0 AND 4),
        evdo_snr SMALLINT NOT NULL CHECK(cdma_level BETWEEN 0 AND 8)
    )
    CREATE TABLE gsm(
        gsm_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT NOT NULL,
        asu SMALLINT CHECK(asu BETWEEN 0 AND 31),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        bit_error_rate SMALLINT CHECK(bit_error_rate BETWEEN 0 AND 7),
        rssi SMALLINT CHECK(rssi BETWEEN -113 AND -51),
        timing_advance SMALLINT
    )
    CREATE TABLE lte(
        lte_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT,
        asu SMALLINT CHECK(asu BETWEEN 0 AND 97),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        cqi SMALLINT CHECK(cqi BETWEEN 0 AND 15),
        cqi_table_index SMALLINT CHECK(cqi_table_index BETWEEN 1 AND 6),
        rsrp SMALLINT CHECK(rsrp BETWEEN -140 AND -43),
        rsrq SMALLINT,
        rssi SMALLINT CHECK(rssi BETWEEN -113 AND -51),
        rssnr SMALLINT CHECK(rssnr BETWEEN -20 AND 30),
        timing_advance SMALLINT CHECK(timing_advance BETWEEN 0 AND 1282)
    )
    CREATE TABLE nr(
        nr_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT CHECK(dbm BETWEEN -140 AND -44),
        asu SMALLINT CHECK(asu BETWEEN 0 AND 97),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        csi_cqi_report SMALLINT[] CHECK(int4range(0, 15, '[]') @> ALL(csi_cqi_report::INT[])),
        csi_cqi_table_index SMALLINT CHECK(csi_cqi_table_index BETWEEN 1 AND 3),
        csi_rsrp SMALLINT CHECK(csi_rsrp BETWEEN -156 AND -31),
        csi_rsrq SMALLINT CHECK(csi_rsrq BETWEEN -20 AND -3),
        csi_sinr SMALLINT CHECK(csi_sinr BETWEEN -23 AND 23),
        ss_rsrp SMALLINT CHECK(ss_rsrp BETWEEN -156 AND -31),
        ss_rsrq SMALLINT CHECK(ss_rsrq BETWEEN -43 AND 20),
        ss_sinr SMALLINT CHECK(ss_sinr BETWEEN -23 AND 40),
        timing_advance_micros SMALLINT CHECK(timing_advance_micros BETWEEN 0 AND 1282)
    )
    CREATE TABLE tdscdma(
        tdscdma_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT CHECK(dbm BETWEEN -120 AND -24),
        asu SMALLINT CHECK(asu BETWEEN 0 AND 96),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        rscp SMALLINT CHECK(dbm BETWEEN -120 AND -24)
    )
    CREATE TABLE wcdma(
        wcdma_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
        dbm SMALLINT CHECK(dbm BETWEEN -120 AND -24),
        asu SMALLINT CHECK(asu BETWEEN 0 AND 96),
        level SMALLINT NOT NULL CHECK(level BETWEEN 0 AND 4),
        ec_no SMALLINT CHECK(dbm BETWEEN -120 AND -24)
    )
    CREATE TABLE users(
        score DOUBLE PRECISION NOT NULL DEFAULT 0.,
        user_id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        picture TEXT NOT NULL
    )
    CREATE TABLE readings(
        reading_id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        -- Geolocation
        gps_timestamp TIMESTAMPTZ NOT NULL,
        coords CIRCLE NOT NULL,
        altitude_level DOUBLE PRECISION,
        altitude_accuracy DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        -- Cellular
        network_type INT,
        carrier_id INT,
        operator_id INT NOT NULL,
        -- Signal
        cell_timestamp TIMESTAMPTZ NOT NULL,
        cdma_id BIGINT REFERENCES cdma(cdma_id),
        gsm_id BIGINT REFERENCES gsm(gsm_id),
        lte_id BIGINT REFERENCES lte(lte_id),
        nr_id BIGINT REFERENCES nr(nr_id),
        tdscdma_id BIGINT REFERENCES tdscdma(tdscdma_id),
        wcdma_id BIGINT REFERENCES wcdma(wcdma_id),
        user_id TEXT NOT NULL REFERENCES users(user_id)
    )
    CREATE TABLE wifi(
        reading_id UUID REFERENCES readings(reading_id) NOT NULL,
        bssid MACADDR8 NOT NULL,
        ssid VARCHAR(32) NOT NULL,
        rssi SMALLINT NOT NULL,
        level SMALLINT NOT NULL,
        max_level SMALLINT NOT NULL,
        frequency SMALLINT NOT NULL,
        channel_width SMALLINT CHECK(channel_width BETWEEN 0 AND 5),
        center_freq_0 SMALLINT,
        center_freq_1 SMALLINT,
        wifi_timestamp TIMESTAMPTZ NOT NULL,
        standard SMALLINT CHECK(standard BETWEEN 4 AND 8 OR standard = 1),
        CHECK(level BETWEEN 0 AND max_level),
        PRIMARY KEY (reading_id, bssid)
    )
    CREATE INDEX ON readings(cdma_id)
    CREATE INDEX ON readings(gsm_id)
    CREATE INDEX ON readings(lte_id)
    CREATE INDEX ON readings(nr_id)
    CREATE INDEX ON readings(tdscdma_id)
    CREATE INDEX ON readings(wcdma_id)
    CREATE INDEX ON readings(cell_timestamp)
    CREATE INDEX ON readings(CAST(operator_id AS TEXT))
    CREATE INDEX ON readings USING GIST(POINT(coords));
