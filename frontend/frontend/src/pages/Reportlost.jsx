function Reportlost(){
    return(
        <div className="page report-lost">
            <h1>Report Lost Item</h1>
            <form>
                <input type="text" placeholder="Item name"></input>
                <textarea name="" id="" placeholder="Description"></textarea>
                <input type = "text" placeholder="Location"></input>
                <button type = "submit">Submit</button>
            </form>
        </div>
    );
}
export default Reportlost;