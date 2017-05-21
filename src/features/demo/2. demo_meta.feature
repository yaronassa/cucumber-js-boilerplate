Feature: Demonstrating meta capabilities
  The infrastructure comes with a skeleton meta-test framework (for testing the infrastructure itself).
  In addition, infrastructure steps can potentially affect future steps and test flow.
  This feature demonstrates these capabilities.

  Scenario: A demo scenario for meta-tests
    #Uncommenting the next line will fail the project meta-test run (terminal -> npm test)
    #And Eval code $.log('Something')
  
  Scenario: A demo scenario for meta-rules validations
    #Comment the following line to fail the 2nd step in the project meta-test run (terminal -> npm test)
    Given This step has a postrequisite
    #Comment the following line to fail the 1st step in the project meta-test run (terminal -> npm test)
    Given This step has a prerequisite

  Scenario: Modifying future steps expected result
    Given The next 2 step should fail
    When I fail this step
    And I fail this step
    Given The next step should fail with custom error
    When I fail this step with error: custom error
  
    