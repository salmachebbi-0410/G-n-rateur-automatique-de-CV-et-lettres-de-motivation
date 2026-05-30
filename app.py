import os
import json
import re
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY manquante dans le fichier .env")
    return Groq(api_key=api_key)


def extract_json(text):
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return json.loads(match.group(1))
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group(0))
        return None


def generate_cv_content(client, data):
    education_str = "\n".join(
        f"- {e.get('degree','')}, {e.get('school','')}, {e.get('year','')}"
        for e in data.get("education", [])
        if e.get("degree")
    )
    experience_str = "\n".join(
        f"- {e.get('title','')}, {e.get('company','')}, {e.get('period','')}: {e.get('description','')}"
        for e in data.get("experience", [])
        if e.get("title")
    )

    prompt = f"""Tu es un expert RH et rédacteur de CV professionnels. Génère du contenu optimisé pour ce profil.

PROFIL:
Nom: {data.get('name', '')}
Poste visé: {data.get('target_job', '')}
Entreprise cible: {data.get('company', '')}
Description du poste: {data.get('job_description', '')}

Formation:
{education_str or 'Non renseignée'}

Expériences:
{experience_str or 'Non renseignée'}

Compétences: {', '.join(data.get('skills', []))}
Langues: {', '.join(data.get('languages', []))}

INSTRUCTIONS:
1. Rédige un résumé professionnel percutant de 3-4 phrases, en lien avec le poste visé.
2. Pour chaque expérience professionnelle, améliore la description avec des verbes d'action forts et des résultats concrets.

Réponds UNIQUEMENT avec ce JSON valide (aucun texte avant ou après):
{{
  "summary": "résumé professionnel ici",
  "enhanced_experiences": [
    {{"title": "titre", "company": "entreprise", "period": "période", "description": "description améliorée"}}
  ]
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1500,
    )
    content = response.choices[0].message.content
    result = extract_json(content)
    if not result:
        result = {"summary": content, "enhanced_experiences": []}
    return result


def generate_cover_letter(client, data):
    education = data.get("education", [])
    main_edu = education[0] if education else {}
    experiences = data.get("experience", [])
    exp_titles = ", ".join(e.get("title", "") for e in experiences if e.get("title"))

    prompt = f"""Tu es un expert en recrutement. Rédige une lettre de motivation professionnelle, personnalisée et convaincante en français.

CANDIDAT:
Nom: {data.get('name', '')}
Email: {data.get('email', '')}
Téléphone: {data.get('phone', '')}
Ville: {data.get('city', '')}

CIBLE:
Poste: {data.get('target_job', '')}
Entreprise: {data.get('company', 'votre entreprise')}
Description du poste: {data.get('job_description', '')}

PROFIL:
Formation: {main_edu.get('degree', '')} - {main_edu.get('school', '')} ({main_edu.get('year', '')})
Expériences: {exp_titles or 'Débutant'}
Compétences: {', '.join(data.get('skills', [])[:6])}
Langues: {', '.join(data.get('languages', []))}

Rédige une lettre de motivation complète avec:
- En-tête (coordonnées candidat, date, destinataire)
- Objet de la lettre
- Paragraphe d'accroche (pourquoi ce poste, cette entreprise)
- Paragraphe compétences/expériences en lien avec l'offre
- Paragraphe motivation et valeur ajoutée
- Conclusion avec appel à l'action
- Formule de politesse professionnelle

La lettre doit être naturelle, enthousiaste et démontrer une vraie connaissance du poste."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=1200,
    )
    return response.choices[0].message.content


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Données invalides"}), 400

        client = get_client()

        cv_content = generate_cv_content(client, data)
        cover_letter = generate_cover_letter(client, data)

        return jsonify({
            "success": True,
            "cv": cv_content,
            "cover_letter": cover_letter,
            "profile": data,
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Erreur serveur: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
