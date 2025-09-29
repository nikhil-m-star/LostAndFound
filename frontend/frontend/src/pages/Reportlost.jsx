function Reportlost(){
    return(
        <div className="page report-lost">
            <div className="glass">
                <h1>Report Lost Item</h1>
                <form>
                    <input type="text" placeholder="Item name" />
                    <textarea name="" id="" placeholder="Description" />
                    <input type = "text" placeholder="Location" />
                    <button type = "submit">Submit</button>
                </form>
            </div>
        </div>
    );
}
export default Reportlost;