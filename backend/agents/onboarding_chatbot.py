from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, AIMessage

from graph.state import DevDocState
from vectorstore.qdrant_store import search_documents
from config import get_settings

settings = get_settings()

# Model 
llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL,
    temperature=0.5,
)
# Prompt template for the onboarding chatbot. It takes retrieved context from the docs and the developer's question, and instructs the LLM to answer based only on that context, providing concise and developer-friendly answers with file paths when relevant.
CHATBOT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful onboarding assistant for a software engineering team.
You answer questions about the codebase using the provided documentation context.

Rules:
- Only answer based on the provided context
- If the answer isn't in the context, say "I don't have documentation for that yet"
- Be concise and developer-friendly
- Include file paths when referencing specific code
- If asked about a function or class, explain what it does and how to use it"""),

    ("human", """Context from codebase documentation:
{context}

Developer's question: {question}

Answer:""")
])

# This node is responsible for answering developer questions about the codebase using a RAG approach. It takes a chat query from the state, searches the Qdrant vector store for relevant documents, builds a context string from the search results, and then calls the Groq LLM with the context and question to generate an answer. The response is returned along with updated chat messages for the frontend to display.
async def onboarding_chatbot_node(state: DevDocState) -> dict:
    """
    LangGraph node — answers developer questions using RAG over stored docs.

    Steps:
    1. Take chat_query from state
    2. Search Qdrant for relevant docs
    3. Build context from search results
    4. Call Groq LLM with context + question
    5. Return chat_response

    This runs as a parallel graph — independent from the doc pipeline.
    """
    query = state.chat_query

    if not query:
        return {"chat_response": "Please ask a question about the codebase."}

    print(f"💬 Chatbot query: {query}")

    # Search relevant docs from Qdrant
    results = await search_documents(
        query=query,
        repo_id=state.repo_id,
        top_k=4
    )

    if not results:
        return {
            "chat_response": "I don't have any documentation for this repo yet. Please run the documentation pipeline first.",
            "current_step": "onboarding_chatbot",
        }

    # Build context string from search results
    context_parts = []
    for r in results:
        context_parts.append(
            f"**File:** {r['file_path']}\n{r['content']}"
        )
    context = "\n\n---\n\n".join(context_parts)

    # Call LLM
    chain = CHATBOT_PROMPT | llm
    response = await chain.ainvoke({
        "context": context,
        "question": query,
    })

    print(f"Chatbot answered: {query[:50]}...")

    # Add to chat history
    new_messages = [
        HumanMessage(content=query),
        AIMessage(content=response.content),
    ]

    return {
        "chat_response": response.content,
        "chat_messages": new_messages,
        "current_step": "onboarding_chatbot",
    }