@demo
Feature: Meta step manipulation
  This feature presents the built-in options for manipulating steps and scenarios

  Scenario: Negative tests (Expecting a step to fail)
    Given I work with a location list with fields: name = lond
    And The next step must fail with ${/Expected location_list to match spec/}
    Then This location list has fields: length = 0

