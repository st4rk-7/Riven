-- Which site rule read each field of an observation (NFR-10), e.g. {"price": "css:#buybox ..."}.
-- NULL for offers parsed in the extension until it sends pages to the server (RIV-37).
ALTER TABLE observations ADD COLUMN parse_rules jsonb;
