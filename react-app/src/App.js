import {Component} from "react";
import axios from "axios";
import xlsx from "json-as-xlsx"

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            quantityInput: 20,
            loaded: false,
            date: '',
            name: '',
            percent: 0
        }
    }

    questions = []

    results = []

    answers = []

    checkPercent(isTrue, index) {
        this.answers[index] = isTrue
        let rightAnswers = this.answers.filter(answer => answer).length
        this.setState({percent: rightAnswers / this.state.quantityInput * 100})
    }

    finishTest() {
        this.results.push(
            {
                name: this.state.name,
                result: `${this.state.percent}%`,
                date: this.state.date
            }
        )
        this.setState({
            loaded: false,
            name: '',
            percent: 0
        })
        this.questions = []
        this.answers = []
        localStorage.setItem('results', JSON.stringify(this.results))
        console.log(this.results)
    }

    downloadExcel() {
        let password = "KBSU2023"
        let passwordCheck = prompt("Чтобы скачать Excel файл введите пароль...")
        let data = [
            {
                sheet: "Результаты",
                columns: [
                    { label: "ФИО", value: "name" },
                    { label: "Результат", value: "result" },
                    { label: "Дата", value: "date" }
                ],
                content: JSON.parse(localStorage.getItem('results')),
            }
        ]
        let settings = {
            fileName: "Результаты теста"
        }
        if (password === passwordCheck) {
            xlsx(data, settings)
        } else alert("Неверный пароль!")
    }

    getQuestions(quantity) {
        axios
            .get('/questions.json')
            .then(response => {
                this.questions = response.data.questions.sort(() => Math.random() - 0.5).slice(0, quantity)
                this.setState({loaded: true})
            })
            .catch(e => {
                console.log(e)
            })
    }

    componentDidMount() {
        let date = new Date()
        this.setState({date: date.toLocaleDateString("ru")})
    }

    render() {
        return (
            <div className="app">
                <div className="app__excel"><button className="button" onClick={() => this.downloadExcel()}>Выгрузить в Excel</button></div>
                <p className="app__date">Дата тестирования: <span>{this.state.date}</span></p>
                <div className="app__info">
                    <label>Ф.И.О: <input type="text" className="large" value={this.state.name}
                                          onInput={e => this.setState({name: e.currentTarget.value})}/></label>
                    <label>Количество вопросов <input type="text" className="small" value={this.state.quantityInput}
                                                      onInput={e => {
                                                          this.setState({quantityInput: +e.currentTarget.value.replace(/\D/g, '').substring(0, 3)})
                                                      }}/></label>

                    <button className="button" disabled={this.state.loaded}
                            onClick={() => this.getQuestions(this.state.quantityInput)}>Начать тест
                    </button>
                </div>
                {
                    this.state.loaded ?
                        <div className="app__questions-list">
                            {
                                this.questions.map((item, key) => {
                                    return (
                                        <div className="app__questions-list__item" key={key}>
                                            <p>{item.title}</p>
                                            {
                                                item.answers.map((answer, childKey) => {
                                                    return (
                                                        <label key={childKey}>
                                                            <input className="radio" type="radio" onInput={() => this.checkPercent(answer.isTrue, key)}
                                                                      name={`q${key}`}/>{answer.answer}</label>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                            <button className="button" onClick={() => this.finishTest()}>Завершить тест</button>
                        </div> : <p>Список вопросов не был получен.</p>
                }
                <div className="app__copyright">Разработка: <a href="https://github.com/frankuu0">Арсен Хамдохов</a> и <a href="https://github.com/Valoudya">Владимир Мисостишхов</a></div>
            </div>
        );
    }
}

export default App;
