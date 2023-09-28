const unpaywallType2 = `
  type UnpaywallType2 {
    doi: ID
    best_oa_location: OaLocationType
    first_oa_location: OaLocationType
    data_standard: Int
    doi_url: String
    genre: String
    is_paratext: Boolean
    is_oa: Boolean
    has_repository_copy: Boolean
    journal_is_in_doaj: Boolean
    journal_is_oa: Boolean
    journal_issns: String
    journal_issn_l: String
    journal_name: String
    oa_locations: [OaLocationType]
    oa_status: String
    published_date: String
    publisher: String
    title: String
    updated: String
    year: String
    z_authors: [ZAuthorsType]
    referencedAt: String
    endValidity: String
  }
`;

module.exports = unpaywallType2;
