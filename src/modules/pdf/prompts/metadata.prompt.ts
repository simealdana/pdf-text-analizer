export function getMetadataPrompt(text: string): string {
  return `
## ROLE
You are an expert document analyst specialized in extracting key information and generating precise metadata.

## TASK
Analyze the following PDF text and generate structured metadata following this process:
1. Read and understand the document content
2. Identify the main topic and context
3. Extract relevant information about the document's purpose
4. Generate a concise description and relevant keywords
5. Ensure metadata is in the same language as the original text

## INSTRUCTIONS
- The description should be clear and concise (maximum 200 characters)
- Keywords should be relevant and specific to the content
- Maintain the original language of the document
- Focus on technical terms, key concepts, and important entities
- Generate between 5-10 keywords

## Example Output
{
  "metadata": {
    "description": "Frontend developer with experience leading teams and optimizing processes in digital banking.",
    "keywords": [
      "Frontend Development",
      "Technical Leadership",
      "CI/CD",
      "Optimization",
      "Micro-Frontends",
      "Components",
      "Santander"
    ]
  }
}

## CONTENT TO ANALYZE
${text}

Respond only with the JSON following the Example Output format:
`;
}
