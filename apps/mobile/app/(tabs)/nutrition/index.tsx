import { View, Text, Pressable, ScrollView } from 'react-native';

export default function NutritionScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">Nutrition</Text>
        <Text className="text-slate-400 mt-2 text-base">
          Your personalized whole-food meal plan
        </Text>
      </View>

      {/* Daily Summary Card */}
      <View className="px-6 mb-6">
        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-sm">Today's Targets</Text>
              <Text className="text-2xl font-bold text-white mt-1">-- kcal</Text>
            </View>
            <Pressable className="bg-indigo-600 px-4 py-2 rounded-xl active:bg-indigo-700">
              <Text className="text-white font-semibold">Generate</Text>
            </Pressable>
          </View>

          {/* Macro Bars */}
          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-indigo-400 text-lg font-bold">--g</Text>
              <Text className="text-slate-500 text-xs">Protein</Text>
            </View>
            <View className="items-center">
              <Text className="text-amber-400 text-lg font-bold">--g</Text>
              <Text className="text-slate-500 text-xs">Carbs</Text>
            </View>
            <View className="items-center">
              <Text className="text-rose-400 text-lg font-bold">--g</Text>
              <Text className="text-slate-500 text-xs">Fat</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Meal Cards Placeholder */}
      <View className="px-6 gap-4">
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((meal) => (
          <View
            key={meal}
            className="bg-slate-900 rounded-2xl p-5 border border-slate-800"
          >
            <Text className="text-slate-500 text-xs uppercase tracking-wider">
              {meal}
            </Text>
            <Text className="text-white text-lg font-semibold mt-2">
              Generate your plan to see {meal.toLowerCase()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
