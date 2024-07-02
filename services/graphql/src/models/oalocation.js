const oaLocationType = `
  type OaLocationType {
    endpoint_id: ID
    evidence: String
    host_type: String
    is_best: Boolean
    license: String
    pmh_id: String
    repository_institution: String
    updated: String
    url: String
    url_for_landing_page: String
    url_for_pdf: String
    version: String
  }
`;

module.exports = oaLocationType;
