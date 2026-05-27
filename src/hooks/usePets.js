import { useState, useEffect, useCallback } from 'react'
import { getAllPets, addPet, updatePet, deletePet } from '../services/petService'

export function usePets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const data = await getAllPets()
      setPets(data)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const criar = async (data) => {
    await addPet(data)
    await refresh()
  }

  const atualizar = async (id, data) => {
    await updatePet(id, data)
    await refresh()
  }

  const remover = async (id) => {
    if (!confirm('Remover este pet?')) return
    await deletePet(id)
    await refresh()
  }

  return { pets, loading, erro, criar, atualizar, remover, refresh }
}
