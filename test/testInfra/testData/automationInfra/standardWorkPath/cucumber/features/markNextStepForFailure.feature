@markNextStepForFailure
Feature: Check the markNextStepForFailure functionality

  Scenario: Test may fail functionality
    Given The next step may fail
    And I run a failed step

    Given The next step may fail
    And I run a step

  Scenario: Test must fail functionality - pass
    Given The next step must fail
    And I run a failed step

  Scenario: Test multiple fail functionality - pass
    Given The next 2 steps must fail
    And I run a failed step
    And I run a failed step

      #expected to fail
  Scenario: Test multiple fail functionality - fail
    Given The next 2 steps must fail
    And I run a failed step
    And I run a step


    #expected to fail
  Scenario: Test must fail functionality - fail
    Given The next step must fail
    And I run a step

  Scenario: Test fail message functionality - pass
    Given The next step must fail with This is a failed step
    And I run a failed step

    Given The next step must fail with ${/a failed step$/}
    And I run a failed step

    #expected to fail
  Scenario: Test fail message functionality - fail
    Given The next step must fail with A bad message
    And I run a failed step