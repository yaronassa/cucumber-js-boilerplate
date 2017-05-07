Feature: Demonstrating boilerplate

  Scenario: A simple scenario
    When I print I'm in the step
    
  #Unskip this test to see how a failed scenario behaves
  @skip
  Scenario: A failing demo scenario
    When I fail this step
