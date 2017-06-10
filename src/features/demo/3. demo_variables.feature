Feature: Variable parsing and processing
  The infrastructure includes a variable processing mechanism, as well as some specific variable handlers.
  This feature demonstrates these capabilities.
  Variables accessing created entities are demonstrated in the next section.
  
  Scenario: Demonstrating string variables
    Given I print Simple string
    And I print ${date_today}
    And I print ${date_today_-1_year_+5_days}
    And I print ${date_today_format_DD/MM}
    And I print ${date_today_format_DD/MM} With a string
    
  Scenario: Demonstrating object variables
    And I print ${[string array, demo]}
    And I print ${/RegExp Demo.*/i}
    
  Scenario: Demonstrating math & random
    And I print ${random_20_40}
    And I print ${=_${this_random.result}*2 + 3}
    
  Scenario: Demonstrating testables
    Given I compare a with a
    And I compare a423423432 with ${/(A|B)\d+/i}
    And I compare ${[a, b]} with ${[a, b]}
    
  Scenario: Demonstrating testable modifiers
    And I compare ${[a, b]} with ${contains:${[a]}}
    And I compare a with ${ignoreCase:A}
    And I compare a with ${trim:      a        }
      
    
