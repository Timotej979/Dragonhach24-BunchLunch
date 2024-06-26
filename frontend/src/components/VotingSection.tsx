import React, { useState, useEffect } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import CategoryCard from './CategoryCard';
import RestaurantChooser from './RestaurantChooser';
import VoteOption from './VoteOption';
import { isCurrentTimeInRange } from './utilities/timeUtils';
import DishCard from './Dishcard';
import Button from './Button';
import SearchBar from './Searchbar';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';

interface Category {
  name: string;
  cuisine: string;
  votes: number;
}

const VotingSection = ({ onCategorySelected }: { onCategorySelected: () => void }) => {
  const [currentPhase, setCurrentPhase] = useState("voting");
  const [categories, setCategories] = useState([
    { name: "Maharaja", cuisine: "Indian", votes: 6 },
    { name: "Das ist Valter", cuisine: "Grill", votes: 6 },
    { name: "Gostilna Čad", cuisine: "Grill", votes: 6 },
  ]);

  const [selectedName, setSelectedName] = useState<string | null>(null);  // Now using name as the identifier
  const [currentName, setCurrentName] = useState(""); // State to manage current selected restaurant name

  const selectCategory = () => {
    onCategorySelected(); // Call the passed function when a category is selected
  };

  // Assume we have similar mock data or API response for dishes
  const [dishes, setDishes] = useState([
    { name: "Chicken Curry", price: 9.99, allergens: ["nuts", "dairy"] },
    { name: "Veggie Pizza", price: 12.49, allergens: ["gluten"] },
    { name: "Beef Steak", price: 15.99, allergens: ["none"] },
  ]);

  const [restaurants, setRestaurants] = useState([
    { name: "Maharaja", cuisine: "Indian", rating: 5, price: "$$"},
    { name: "Grill Town", cuisine: "Grill", rating: 2, price: "$$$"},
    { name: "Pasta Central", cuisine: "Italian", rating: 1, price: "$"},
  ]);

  const [manualOverride, setManualOverride] = useState(false);

  
  useEffect(() => {
    // Fetch the parsed data here using fetch or any other method
    const fetchParsedData = async () => {
      // Get the user's location
      navigator.geolocation.getCurrentPosition(async function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const object = { "lat":lat, "lon":lon};

        /*
        // Call the API to get the list of restaurants
        const response = await fetch(`/api/restaurants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(object),
        });

        const jsonData = await response.json();

        // Parse the response and call onSelect with the restaurant name
        const parsedData: Record<string, { name: string; price: number; rating: number }> = {};
        for (const key in jsonData) {
          if (Object.prototype.hasOwnProperty.call(jsonData, key)) {
            const name = key.replace("venue-", "");
            const { p: price, r: rating } = jsonData[key];
            parsedData[name] = { name, price, rating };
          }
        }

        // Select three random restaurants
        const restaurantNames = Object.keys(parsedData);
        const randomRestaurantNames = restaurantNames.sort(() => 0.5 - Math.random()).slice(0, 3);
        // Replace the first character of the every restaurant name with a capital character
        randomRestaurantNames.forEach((name, index) => {
          randomRestaurantNames[index] = name.charAt(0).toUpperCase() + name.slice(1);
        });

        // Generate three random vote numbers
        const randomVotes = randomRestaurantNames.map(() => Math.floor(Math.random() * 10));

        // Generate three random cuisine types
        const cuisines = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'Thai'];
        const randomCuisines = randomRestaurantNames.map(() => cuisines[Math.floor(Math.random() * cuisines.length)]);

        // Set the categories based on the parsed data
        const newCategories = randomRestaurantNames.map((name, index) => {
          const restaurantData = parsedData[name];
          if (restaurantData) {
            const { price, rating } = restaurantData;
            return { name, cuisine: randomCuisines[index], votes: randomVotes[index] };
          } else {
            // Handle the case where parsedData[name] is undefined
            console.error(`Data for restaurant ${name} is missing.`);
            return { name, cuisine: "Unknown", votes: 0 };
          }
        });

        // Update the categories state
        setCategories(newCategories);
      
        // Set the restaurants state
        const newRestaurants = randomRestaurantNames.map((name, index) => {
          const restaurantData = parsedData[name];
          if (restaurantData) {
            // Check if the restaurant data is present in the parsed data
            if (parsedData[name].rating == -1) {
              parsedData[name].rating = Math.floor(Math.random() * 5) + 1;
            }
            if (parsedData[name].price == -1) {
              parsedData[name].price = 2;
            }
            // Convert the price to a string
            const price = "$".repeat(parsedData[name].price);
            // Return the restaurant object
            return { name, cuisine: randomCuisines[index], rating: parsedData[name].rating, price: price };
          } else {
            // Handle the case where parsedData[name] is undefined
            // Generate random rating and price for the restaurant 
            var price = "$".repeat(Math.floor(Math.random() * 5) + 1);
            var rating = Math.floor(Math.random() * 5) + 1;
            console.error(`Data for restaurant ${name} is missing.`);
            return { name, cuisine: "Unknown", rating, price };
          }
        });

        // Update the restaurants state
        setRestaurants(newRestaurants);
        
        */
      });
    };

    fetchParsedData();
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      const currentTime = new Date();
      let newPhase = 'waiting'; // Default to 'waiting'
      if (currentTime.getHours() < 11 || (currentTime.getHours() === 11 && currentTime.getMinutes() < 30)) {
        newPhase = 'voting';
      } else if (currentTime.getHours() === 11 && currentTime.getMinutes() < 45) {
        newPhase = 'choosing';
      }
      setCurrentPhase(newPhase);
    }, 15*60000); // Update every minute

    return () => clearInterval(timerId);
  }, []);

  // Initial sorting of categories
  useEffect(() => {
    const sortedCategories = [...categories].sort((a, b) => b.votes - a.votes);
    const isSorted = JSON.stringify(categories) === JSON.stringify(sortedCategories);
    if (!isSorted) setCategories(sortedCategories);
    
  }, [categories]); // Run this effect only once, on component mount

  const handleVote = (name: string) => {
    const index = categories.findIndex(cat => cat.name === name);

    if (selectedName === name) {  // Toggle vote off
      unvoteCategory(index);
    } else if (selectedName && selectedName !== name) {  // Change vote
      changeVote(index);
    } else {  // New vote
      voteForCategory(index);
    }
  };

  const handleDishSelection = (name: string) => {
    if (selectedName === name) {  // Toggle selection off
      setSelectedName(null);
    } else {  // New selection
      setSelectedName(name);
    }
  };

  const voteForCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index].votes += 1;
    setCategories(newCategories);
    setSelectedName(categories[index].name);
    setCurrentName(categories[index].name); // Update currentName when a new category is voted
  };

  const unvoteCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index].votes -= 1;
    setCategories(newCategories);
    setSelectedName(null);
    setCurrentName(""); // Reset currentName when unvoting a category
  };

  const switchToDishChoosing = () => {
    setCurrentPhase("choosing");
  };

  const switchToDishWaiting = () => {
    setCurrentPhase("waiting");
  };

  const changeVote = (index: number) => {
    const newCategories = [...categories];
    const oldIndex = categories.findIndex(cat => cat.name === selectedName);
    if (oldIndex !== -1) {
      newCategories[oldIndex].votes -= 1;
    }
    newCategories[index].votes += 1;
    setCategories(newCategories);
    setSelectedName(categories[index].name);
    setCurrentName(categories[index].name); // Update currentName when changing vote
  };

  const renderContentBasedOnPhase = () => {
    switch (currentPhase) {
      case "voting":
        return (
          <>
            {categories.map((category, index) => (
              <Flipped key={category.name} flipId={category.name}>
                <div>
                  <CategoryCard
                    votes={category.votes}
                    name={category.name}
                    cuisine={category.cuisine}
                    selected={category.name === selectedName}
                    onClick={() => handleVote(category.name)}
                    leadingCard={index === 0}
                  />
                </div>
              </Flipped>
            ))}
              {restaurants.map((restaurant, index) => (
                <Flipped key={index} flipId={`restaurant-${index}`}>
                  {index === restaurants.length - 1 ? (
                    <div className="bg-green-500 p-4 border rounded-lg shadow-lg bg-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  ) : (
                    <div>
                      <RestaurantCard
                        name={restaurant.name}
                        cuisine={restaurant.cuisine}
                        rating={restaurant.rating}
                        price={restaurant.price}
                      />
                    </div>
                  )}
                </Flipped>
              ))}
          </>
        );
      case "choosing":
        return dishes.map((dish, index) => (
          <Flipped key={dish.name} flipId={dish.name}>
            <div>
              <DishCard
                name={dish.name}
                price={dish.price}
                allergens={dish.allergens}
                selected={dish.name === selectedName}
                onClick={() => handleDishSelection(dish.name)}
              />
            </div>
          </Flipped>
        ));
      case "waiting":
        return (
          <>
            <div></div>
            <div className='flex justify-center items-center'>
              <img src="/icons/mothafukin_truck.gif" alt="Waiting" className='h-24 w-24' />
            </div>
            <div></div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Flipper flipKey={`${currentPhase}-${JSON.stringify(categories)}-${JSON.stringify(dishes)}`}>
      <div className="space-y-8">
        <h2 className="text-3xl font-bold px-4 py-4 font-montserrat text-black">
          {currentPhase === "voting" && "1. Vote for a restaurant to make a group order from"}
          {currentPhase === "choosing" && `2. Choose your dish from restaurant: ${currentName}`}
          {currentPhase === "waiting" && "3. Your group order is on the way!"}
        </h2>
        <div className="bg-white rounded-lg shadow-md mt-12">
          <VoteOption timeRange="00:00-11:30" actionDescription="Vote restaurant" currentPhase={currentPhase}/>
          <VoteOption timeRange="11:30-11:45" actionDescription="Choose dish" currentPhase={currentPhase}/>
          <VoteOption timeRange="11:45-" actionDescription="Wait for your food" currentPhase={currentPhase}/>
        </div>
        {currentPhase === "voting" && (
          <Button label="Choose Dishes" primary={true} onClick={switchToDishChoosing} />
        )}
        {currentPhase === "choosing" && (
          <Button label="Skip choosing period to order NOW" primary={true} onClick={switchToDishWaiting} />
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold mb-4">{currentPhase === "voting" ? "Categories" : "Choose your Dish"}</h2>
          <div className="grid grid-cols-3 gap-4 text-black">
            {renderContentBasedOnPhase()}
          </div>
        </div>
      </div>
    </Flipper>
  );
};

export default VotingSection;
