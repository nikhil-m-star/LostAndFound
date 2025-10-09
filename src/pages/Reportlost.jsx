function Reportlost(){
    return(
        <div className="page report-lost">
            <div className="glass">
                <div className="glass-inner">
                    <div className="col">
                        <h1>Lost</h1>
                        <p>Report an item you lost. Provide details so others can help locate it.</p>
                    </div>
                    <div className="col">
                        <form>
                            <input type="text" placeholder="Item name" />
                            <textarea name="" id="" placeholder="Description" />
                            <input type = "text" placeholder="Location" />
                            <button type = "submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Reportlost;