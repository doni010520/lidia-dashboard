from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from supabase import create_client, Client
from typing import Optional

app = FastAPI(title="LidIA Dashboard API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL e SUPABASE_KEY devem estar configurados")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class PeriodoRequest(BaseModel):
    data_inicio: str
    data_fim: str


@app.get("/")
def read_root():
    return {"status": "ok", "app": "LidIA Dashboard API"}


@app.get("/api/resumo")
def get_resumo():
    """Retorna resumo geral (hoje, semana, mês)"""
    try:
        hoje = datetime.now().date()
        inicio_semana = hoje - timedelta(days=hoje.weekday())
        inicio_mes = hoje.replace(day=1)
        
        # Query diária para hoje
        response_hoje = supabase.table("paes_relatorio_diario_completo")\
            .select("*")\
            .eq("data", str(hoje))\
            .execute()
        
        # Query semanal
        response_semana = supabase.table("paes_relatorio_semanal_completo")\
            .select("*")\
            .eq("semana_inicio", str(inicio_semana))\
            .execute()
        
        # Query mensal
        mes_atual = hoje.strftime('%Y-%m')
        response_mes = supabase.table("paes_relatorio_mensal_completo")\
            .select("*")\
            .eq("mes", mes_atual)\
            .execute()
        
        return {
            "hoje": response_hoje.data[0] if response_hoje.data else None,
            "semana": response_semana.data[0] if response_semana.data else None,
            "mes": response_mes.data[0] if response_mes.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/relatorio-diario")
def get_relatorio_diario(dias: int = 30):
    """Retorna relatório diário dos últimos N dias"""
    try:
        data_inicio = datetime.now().date() - timedelta(days=dias)
        
        response = supabase.table("paes_relatorio_diario_completo")\
            .select("*")\
            .gte("data", str(data_inicio))\
            .order("data", desc=True)\
            .execute()
        
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/relatorio-periodo")
def get_relatorio_periodo(periodo: PeriodoRequest):
    """Retorna relatório de um período específico"""
    try:
        response = supabase.table("paes_relatorio_diario_completo")\
            .select("*")\
            .gte("data", periodo.data_inicio)\
            .lte("data", periodo.data_fim)\
            .order("data", desc=False)\
            .execute()
        
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/relatorio-semanal")
def get_relatorio_semanal(semanas: int = 12):
    """Retorna relatório semanal das últimas N semanas"""
    try:
        response = supabase.table("paes_relatorio_semanal_completo")\
            .select("*")\
            .order("semana_inicio", desc=True)\
            .limit(semanas)\
            .execute()
        
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/relatorio-mensal")
def get_relatorio_mensal(meses: int = 12):
    """Retorna relatório mensal dos últimos N meses"""
    try:
        response = supabase.table("paes_relatorio_mensal_completo")\
            .select("*")\
            .order("mes", desc=True)\
            .limit(meses)\
            .execute()
        
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/usuarios-ativos")
def get_usuarios_ativos():
    """Retorna ranking de usuários mais ativos"""
    try:
        response = supabase.table("paes_ranking_usuarios_ativos")\
            .select("*")\
            .limit(10)\
            .execute()
        
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
def get_stats():
    """Retorna estatísticas gerais"""
    try:
        # Total de registros
        response_total = supabase.table("paes_atendimentos_log")\
            .select("*", count="exact")\
            .execute()
        
        # Total de pessoas únicas
        response_pessoas = supabase.table("paes_contacts")\
            .select("*", count="exact")\
            .execute()
        
        return {
            "total_interacoes": response_total.count,
            "total_pessoas": response_pessoas.count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4142)
