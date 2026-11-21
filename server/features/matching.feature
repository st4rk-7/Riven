# EC4206 Role B (B4). Requirement: FR-04 Matching (also NFR-05 for the kept price).
# Role A manual cases: TC-OFFER-001 (same identifier), TC-OFFER-002 (conflict), TC-OFFER-003 (title only).
# Runs the server's save path rules (schema check, source, matching, observation) without HTTP or PostgreSQL.
Feature: Know whether a competitor offer is really my product
  As a retailer
  I want each offer the extension sends to be linked to my product only when it is really the same product
  So that I compare like with like and decide uncertain matches myself

  Scenario: An offer with my product's ASIN is confirmed and keeps its price
    Given I track "M185 Wireless Mouse, Grey" by "Logitech" with ASIN "B004YAVF8I"
    When the extension sends the Amazon UK offer "Logitech M185 Wireless Mouse" with ASIN "B004YAVF8I" priced "9.99" "GBP"
    Then the offer is linked to "M185 Wireless Mouse, Grey" with status "confirmed"
    And the observation records "9.99" "GBP" from "Amazon UK"

  # An offer linked to no product is stored unverified with no product until the retailer decides.
  Scenario Outline: A title alone never confirms an offer
    Given I track "M185 Wireless Mouse, Grey" by "Logitech" without an ASIN
    When the extension sends the Amazon UK offer "<offer title>" with ASIN "B07W6JN8V8" priced "8.49" "GBP"
    Then the offer is linked to "<linked product>" with status "<status>"

    Examples:
      | offer title                                 | linked product            | status     |
      | Logitech M185 Wireless Mouse - Swift Grey   | M185 Wireless Mouse, Grey | unverified |
      | Logitech M190 Full-Size Wireless Mouse      | none                      | unverified |
      | Logitech M185 Wireless Mouse, Grey, 2-Pack  | none                      | unverified |
