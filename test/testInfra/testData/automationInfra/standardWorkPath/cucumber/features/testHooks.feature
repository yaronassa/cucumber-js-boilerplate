@hooks
Feature: Run standard test steps to test hook functionality

  Scenario: Standard first scenario
    Given I run a step
    And I run a failed step

  Scenario: Standard async scenario
    Given I run a step
