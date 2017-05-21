Feature: Demonstrating meta-test boilerplate
  
  Scenario: A meta-test demo scenario
    Given I run a test step
    
  Scenario: No real scenario contains debug steps
    Given All /.feature$/i files in src/features don't contain the string: /^\s*(?:Given|Then|When|And) Eval code/im
    #Uncomment the relevant line in src/features/demo/demo.feature to see the test fail
  
  Scenario: All real scenarios adhere to custom rules (when applicable)
    Given All scenarios in src/features adhere to step prerequisite rule
    Given All scenarios in src/features adhere to step postrequisite rule