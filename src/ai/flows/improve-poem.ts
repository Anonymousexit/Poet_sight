'use server';
/**
 * @fileOverview A flow to improve an existing poem based on user feedback.
 *
 * - improvePoem - A function that improves the poem.
 * - ImprovePoemInput - The input type for the improvePoem function.
 * - ImprovePoemOutput - The return type for the improvePoem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePoemInputSchema = z.object({
  poem: z.string().describe('The poem to improve.'),
  feedback: z.string().describe('The user feedback on how to improve the poem.'),
});
export type ImprovePoemInput = z.infer<typeof ImprovePoemInputSchema>;

const ImprovePoemOutputSchema = z.object({
  improvedPoem: z.string().describe('The improved poem.'),
});
export type ImprovePoemOutput = z.infer<typeof ImprovePoemOutputSchema>;

export async function improvePoem(input: ImprovePoemInput): Promise<ImprovePoemOutput> {
  return improvePoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePoemPrompt',
  input: {schema: ImprovePoemInputSchema},
  output: {schema: ImprovePoemOutputSchema},
  prompt: `You are a world-class poet, skilled at refining existing poems based on feedback.

  Here is the poem to improve:
  {{poem}}

  Here is the feedback from the user on how to improve the poem:
  {{feedback}}

  Please improve the poem based on the feedback.  Return the improved poem.
  Improved Poem: `,
});

const improvePoemFlow = ai.defineFlow(
  {
    name: 'improvePoemFlow',
    inputSchema: ImprovePoemInputSchema,
    outputSchema: ImprovePoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      improvedPoem: output!.improvedPoem,
    };
  }
);
