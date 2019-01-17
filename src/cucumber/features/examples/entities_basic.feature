@demo
Feature: Entities and assertions examples
  This feature shows entity retrieval, validation and manipulation scenarios.
  The entities are based on the MetaWeather API (https://www.metaweather.com/api/) and the JSON placeholder API (https://jsonplaceholder.typicode.com/)

  Scenario: Basic entity retrieval
    Given I work with a location list with fields: name = lond
    Then This location list has fields: length = 1

  Scenario: Validating list items
    Given I work with a location list with fields: name = lond
    Then This location list contains an item with fields: title = London
    And This location list doesn't contain an item with fields: title = Other city

  Scenario: Using entities as references for other entities
    Given I work with a location list with fields: name = lond
    And From this location list, I work with a location with: title = London
    Then This location exists
    And from this location, I work with a forecast
    Then this forecast exists

  Scenario: Checking item order
    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=${/melissa.tv/}
    Then This json user exists
    And This json user has fields: #=2

  Scenario: Using object properties as separate entities
    Given I work with a location list with fields: name = lond
    And From this location list, I work with a location with: title = London
    And from this location, I work with a forecast
    And I work with the .consolidated_weather.0 property from this forecast
    Then This property has fields: humidity = ${/\d+/}

    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=${/melissa.tv/}
    And I work with the .company property of this json user
    Then This property has fields: name = Deckow-Crist

  Scenario: Working with entity ordinals
    Given I work with the json user list with fields: username = Antonette
    And I work with the json user list with fields: username = Leopoldo_Corkery
    Then json user list #1 contains an item with fields: id = 2
    And json user list #2 contains an item with fields: id = 6
    And json user list #1 has fields: length = ${entities_json_user_list_2.length}

  Scenario: Working with entity variables
    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=${/melissa.tv/}
    Then The variable ${this_json_user.name} equals Ervin Howell

  Scenario: Mixing systems
    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=${/melissa.tv/}
    And I work with the .address.geo property of this json user
    Given I work with a location list with fields: location = ${[${this_property.lat}\, ${this_property.lng}]}
    Then This location list contains an item with fields: title = Johannesburg
