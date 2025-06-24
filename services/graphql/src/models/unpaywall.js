const Unpaywall = `
  type Unpaywall {
    doi: ID
    doi_url: String
    title: String
    genre: String
    is_paratext: Boolean
    published_date: String
    year: Int
    journal_name: String
    journal_issns: String
    journal_issn_l: String
    journal_is_oa: Boolean
    journal_is_in_doaj: Boolean
    publisher: String
    is_oa: Boolean
    oa_status: String
    has_repository_copy: Boolean
    data_standard: Int
    updated: String

    z_authors: [Author]
    best_oa_location: OALocation
    first_oa_location: OALocation
    oa_locations: [OALocation]
    oa_locations_embargoed: [OALocation]
  }
`;

module.exports = Unpaywall;
