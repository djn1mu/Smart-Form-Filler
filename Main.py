words_data = {"Pair": 4, "Hair": 4, "Chair": 5, "Graphic": 7}

def main():
    """Displays a welcome message and lists words with their point values."""
    print("Welcome to spelling Bee!")
    print("-" * 30) # Separator for better readability
    for word, points in words_data.items():
        print(f"{word} is worth {points} points")
    print("-" * 30)

if __name__ == "__main__":
    main()