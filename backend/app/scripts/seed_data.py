import asyncio
import random
from faker import Faker

from app.core.db import async_session
# Import Ingredient (the master list) and Unit
from app.models.category import Category
from app.models.category_group import CategoryGroup
from app.models.recipe_category import RecipeCategory
from app.models.recipe import Recipe
from app.models.user import User
from app.models.ingredient import Ingredient  # Ensure this model exists
from app.models.recipe_ingredient import RecipeIngredient
from app.models.recipe_step import RecipeStep

fake = Faker()

NUM_USERS = 10
NUM_CATEGORY_GROUPS = 4
NUM_CATEGORIES_PER_GROUP = 5
NUM_RECIPES = 50
MAX_INGREDIENTS_PER_RECIPE = 8
MAX_STEPS_PER_RECIPE = 10

async def seed():
    async with async_session() as session:
        # 1. Create users (Fix: email now matches model)
        users = [
            User(
                username=fake.unique.user_name(),
                display_name=fake.name(),
                email=fake.unique.email(),
            )
            for _ in range(NUM_USERS)
        ]
        session.add_all(users)
        await session.flush()

        # 2. Create category groups
        category_groups = [
            CategoryGroup(name=f"Group {fake.unique.word().capitalize()}",
                          description=fake.sentence())
            for _ in range(NUM_CATEGORY_GROUPS)
        ]
        session.add_all(category_groups)
        await session.flush()

        # 3. Create categories
        categories = []
        for group in category_groups:
            for _ in range(NUM_CATEGORIES_PER_GROUP):
                category = Category(
                    name=fake.unique.word().capitalize(),
                    group_id=group.id
                )
                categories.append(category)
        session.add_all(categories)
        await session.flush()

        # 4. Create Master Ingredients (Fix: Use Ingredient class, not RecipeIngredient)
        master_ingredients = [
            Ingredient(name=fake.unique.word().capitalize(), description=fake.sentence())
            for _ in range(50)
        ]
        session.add_all(master_ingredients)
        await session.flush()

        # 5. Create recipes
        recipes = []
        for _ in range(NUM_RECIPES):
            recipe = Recipe(
                user_id=random.choice(users).id,
                name=fake.sentence(nb_words=3).rstrip('.'),
                description=fake.text(max_nb_chars=200),
                cook_time_minutes=random.randint(10, 120),
                servings=random.randint(1, 8),
                is_public=True,
            )
            recipes.append(recipe)
        session.add_all(recipes)
        await session.flush()

        # 6. Assign categories to recipes
        for recipe in recipes:
            assigned = random.sample(categories, k=random.randint(1, 3))
            for cat in assigned:
                session.add(RecipeCategory(recipe_id=recipe.id, category_id=cat.id))

        # 7. Add ingredients to recipes (Fix: Linking recipe to master ingredient)
        for recipe in recipes:
            selected_ings = random.sample(master_ingredients,
                                    k=random.randint(2, MAX_INGREDIENTS_PER_RECIPE))
            for idx, ing in enumerate(selected_ings):
                session.add(
                    RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ing.id, # Link to the master ID
                        name_text=ing.name,   # Keep the text for historical record
                        quantity=round(random.uniform(0.5, 5.0), 2),
                        display_order=idx
                    )
                )

        # 8. Add recipe steps
        for recipe in recipes:
            num_steps = random.randint(1, MAX_STEPS_PER_RECIPE)
            for i in range(1, num_steps + 1):
                session.add(
                    RecipeStep(
                        recipe_id=recipe.id,
                        step_number=i,
                        instruction=fake.sentence(),
                        estimated_minutes=random.randint(1, 15)
                    )
                )

        await session.commit()
        print("✅ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
