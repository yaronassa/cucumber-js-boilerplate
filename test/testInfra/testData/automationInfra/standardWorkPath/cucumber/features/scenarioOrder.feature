@scenarioOrder
Feature: Run standard test steps to test scenario order functionality


  Scenario: first scenario
    Given I run a step

    @teardown
  Scenario: pushed to last
    Given I run a step

  Scenario: middle scenario
    Given I run a step

  Scenario: last scenario
    Given I run a step

    @setup
  Scenario: pushed to first
    Given I run a step
