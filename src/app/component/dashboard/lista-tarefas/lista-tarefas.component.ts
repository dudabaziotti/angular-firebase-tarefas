import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-lista-tarefas',
  templateUrl: './lista-tarefas.component.html',
  styleUrl: './lista-tarefas.component.scss'
})
export class ListaTarefasComponent implements OnInit {

  visualizarLista: boolean = false;
  tarefaForm: FormGroup;
  editarForm: FormGroup;
  tarefas: any[] = [];
  tarefaEditando: any = null;

  constructor(private fb: FormBuilder, private db: AngularFirestore) { 
    this.tarefaForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      dificuldade: ['', Validators.required]
    });

    this.editarForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      dificuldade: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTarefas();
  }

  //abre a caixa de edicao e altera no banco de dados
  abrirEdicao(tarefa: any): void {
    this.tarefaEditando = tarefa;
    this.editarForm.patchValue({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      dificuldade: tarefa.dificuldade
    });
  }
  
  //salva as edicoes feitas na tarefa e fecha a caixa de edicao apos finalizar
  onEditSubmit(id: string): void {
    if (this.editarForm.valid) {
      const tarefaAtualizada = this.editarForm.value;
      this.db.collection('tarefas').doc(id).update(tarefaAtualizada).then(() => {
        alert('Tarefa atualizada!');
        this.tarefaEditando = null;
        this.editarForm.reset();
        this.loadTarefas();
      }).catch(error => {
        console.error('Erro ao atualizar tarefa: ', error);
      });
    }
  }

  //verifica o formulario de criacao de uma nova tarefa e adiciona no banco de dados, em caso de sucesso limpa o formulario
  //para a adicao de novas tarefas e recarrega a lista
  onSubmit(): void {
    if (this.tarefaForm.valid) {
      let tarefa = this.tarefaForm.value;
      tarefa.concluida = false;
      this.db.collection('tarefas').add(tarefa).then(() => {
        alert('Tarefa adicionada!');
        this.tarefaForm.reset();
        this.loadTarefas();
      }).catch(error => {
        console.error('Erro ao adicionar tarefa: ', error);
      });
    }
  }

  //consulta o banco de dados e monitora as mudancas, para atualiza-las assim que necessario
  loadTarefas(): void {
    this.db.collection('tarefas').valueChanges({ idField: 'id' }).subscribe({
      next: (tarefas: { id: string; }[]) => {
        this.tarefas = tarefas;
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefas: ', error);
      }
    });
  }

  ativarLista() {
    this.visualizarLista = true;
  }

  //procura a tarefa no banco de dados e muda seu estado para concluida, em caso de sucesso, recarrega a lista 
  concluirTarefa(titulo: string): void {
    const tarefa = this.tarefas.find(t => t.titulo === titulo);
    if (tarefa) {
      this.db.collection('tarefas').doc(tarefa.id).update({ concluida: true }).then(() => {
        this.loadTarefas();
      }).catch(error => {
        console.error('Erro ao concluir tarefa: ', error);
      });
    }
  }

  //procura a tarefa no banco de dados e deleta a mesma, em caso de sucesso, recarrega a lista 
  excluirTarefa(titulo: string): void {
    const tarefa = this.tarefas.find(t => t.titulo === titulo);
    if (tarefa) {
      this.db.collection('tarefas').doc(tarefa.id).delete().then(() => {
        this.loadTarefas();
      }).catch(error => {
        console.error('Erro ao excluir tarefa: ', error);
      });
    }
  }
}
