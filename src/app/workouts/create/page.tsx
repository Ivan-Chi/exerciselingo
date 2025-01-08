import { createClient } from "@/utils/supabase/server";

export default async function CreateWorkout() {
    const supabase = await createClient();

    const { data: exercises, error} = await supabase
        .from('exercises')
        .select('*')
        // FIXME: Random 4
        .limit(4)
    
    if (error) {
        console.log("Error: ", error);
        return <div>Error loading exercises.</div>
    }

    console.log(exercises);

   return (
        <div>
            <h1>Create Workout</h1>
            <div>
                {exercises.map((exercise) => (
                    <div key={exercise.id}>
                        <p>{exercise.name}</p>
                        <p>{exercise.description}</p>
                        <p>{exercise.category}</p>
                    </div>
                ))}
            </div>
        </div>
   )
}